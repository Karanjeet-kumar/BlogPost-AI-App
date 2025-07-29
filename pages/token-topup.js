import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../components/AppLayout/AppLayout";
import { getAppProps } from "../utils/getAppProps";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faCoins,
} from "@fortawesome/free-solid-svg-icons";

export default function TokenTopup(props) {
  const handleClick = async () => {
    const result = await fetch(`/api/addTokens`, {
      method: "POST",
    });
    const json = await result.json();
    console.log("RESULT: ", json);
    window.location.href = json.session.url;
  };

  const hasTokens = props.availableTokens > 0;

  const containerBg = hasTokens
    ? "bg-gradient-to-br from-yellow-50 to-yellow-100"
    : "bg-gradient-to-br from-red-50 to-red-100";

  const borderColor = hasTokens ? "border-yellow-300" : "border-red-300";

  const iconColor = hasTokens ? "text-yellow-500" : "text-red-500";

  const headingText = hasTokens ? "Top Up Your Tokens" : "You're Out of Tokens";

  const messageText = hasTokens ? (
    <>
      You currently have{" "}
      <strong className="text-yellow-500">
        {props.availableTokens} tokens
      </strong>
      . You can top up to avoid interruption in future.
    </>
  ) : (
    <>
      You have <strong className="text-red-500">0 token</strong>. Please add
      tokens to continue using the app.
    </>
  );

  return (
    <div
      className={`h-full w-full flex items-center justify-center ${containerBg}`}
    >
      <div
        className={`max-w-screen-sm w-full bg-white p-8 rounded-xl shadow-2xl border ${borderColor} text-center`}
      >
        <div className="flex justify-center mb-4">
          <FontAwesomeIcon
            icon={hasTokens ? faCoins : faExclamationTriangle}
            className={`text-5xl ${iconColor}`}
          />
        </div>
        <h1 className={`text-3xl font-bold mb-3 ${iconColor}`}>
          {headingText}
        </h1>
        <p className="text-slate-600 mb-6">{messageText}</p>

        <button
          className="btn bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition-transform active:scale-95"
          onClick={handleClick}
        >
          Add Tokens
        </button>
      </div>
    </div>
  );
}

TokenTopup.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const props = await getAppProps(ctx);
    return {
      props,
    };
  },
});
