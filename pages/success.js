import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../components/AppLayout/AppLayout";
import { getAppProps } from "../utils/getAppProps";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

export default function Success() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <div className="max-w-screen-sm w-full bg-white p-8 rounded-xl shadow-2xl border border-green-200 text-center">
        <div className="flex justify-center mb-4">
          <FontAwesomeIcon
            icon={faCheckCircle}
            className="text-green-500 text-5xl"
          />
        </div>
        <h1 className="text-3xl font-bold text-green-700 mb-3">
          Thank you for your purchase!
        </h1>
        <p className="text-slate-600">
          Your transaction was successful. You can now continue using the app
          with your updated tokens.
        </p>
      </div>
    </div>
  );
}

Success.getLayout = function getLayout(page, pageProps) {
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
