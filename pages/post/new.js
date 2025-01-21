import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../../components/AppLayout/applayout";
import { useState } from "react";
import Markdown from "react-markdown";

export default function NewPost() {
  const [postContent, setPostContent] = useState("");
  const handleSubmit = async () => {
    const response = await fetch(`/api/generatePost`, {
      method: "POST",
    });
    const json = await response.json;
    console.log("RESULT: ", json);
    setPostContent(json.postContent);
  };

  return (
    <div>
      <h1>This is the new post page.</h1>
      <button className="btn" onClick={handleSubmit}>
        Generate
      </button>
      <Markdown>{postContent}</Markdown>
    </div>
  );
}

NewPost.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps = withPageAuthRequired(() => {
  return {
    props: {},
  };
});
