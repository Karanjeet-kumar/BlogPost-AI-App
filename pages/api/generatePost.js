import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { Configuration, OpenAIApi } from "openai";
import clientPromise from "../../lib/mongodb";

export default withApiAuthRequired(async function handler(req, res) {
  const { user } = await getSession(req, res);
  const client = await clientPromise;
  const db = client.db("BlogPost");
  const userProfile = await db.collection("users").findOne({
    auth0Id: user.sub,
  });

  if (!userProfile?.availableTokens) {
    res.status(403);
    return;
  }

  const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(config);

  const { topic, keywords } = req.body;

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
            You are an SEO friendly blog post generator.
            You are designed to output markdown without frontmatter.
        `,
        },
        {
          role: "user",
          content: `
            Generate me a long and detailed SEO friendly blog post on following topic delimited by triple hyphens:
            ---
            ${topic}
            ---
            Targetting the following comma seperated keywords delimited by triple hyphens:
            ---
            ${keywords}
            ---
        `,
        },
      ],
    });

    const postContent = response.data.choices[0]?.message.content;

    const seoResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
            You are an SEO friendly blog post generator.
            You are designed to output JSON. Do not include HTML tags in your output.
        `,
        },
        {
          role: "user",
          content: `
            Generate an SEO friendly title and SEO friendly meta description for the following blog post. 
            ${postContent}
            ---
            The output json must be in the following format:
            {
              "title": "example title",
              "metaDescription" : "example meta description"
            }
        `,
        },
      ],
      response_format: { type: "json_object" },
    });

    const { title, metaDescription } = JSON.parse(
      seoResponse.data.choices[0]?.message?.content
    );

    console.log(seoResponse.data.choices[0]?.message?.content);

    await db.collection("users").updateOne(
      {
        auth0Id: user.sub,
      },
      {
        $inc: {
          availableTokens: -1,
        },
      }
    );

    const post = await db.collection("posts").insertOne({
      postContent: postContent || "",
      title: title || "",
      metaDescription: metaDescription || "",
      topic,
      keywords,
      userId: userProfile._id,
      created: new Date(),
    });

    res.status(200).json({ post: { postContent, title, metaDescription } });
  } catch (error) {
    console.error("Error generating blog post:", error.message || error);
    res.status(500).json({ error: "Failed to generate blog post." });
  }
});
