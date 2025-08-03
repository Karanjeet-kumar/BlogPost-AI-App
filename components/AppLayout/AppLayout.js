import { useUser } from "@auth0/nextjs-auth0/client";
import { faCoins } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import PostsContext from "../../context/postsContext";
import { Logo } from "../Logo/Logo";

export const AppLayout = ({
  children,
  availableTokens,
  posts: postsFromSSR,
  postId,
  postCreated,
}) => {
  const { user } = useUser();
  const { setPostsFromSSR, posts, getPosts, noMorePosts } =
    useContext(PostsContext);

  const [loadingSidebar, setLoadingSidebar] = useState(true);

  useEffect(() => {
    setPostsFromSSR(postsFromSSR);
    setLoadingSidebar(false);

    if (postId) {
      const exists = postsFromSSR.find((post) => post._id === postId);
      if (!exists) {
        getPosts({ getNewerPosts: true, lastPostDate: postCreated });
      }
    }
  }, [postsFromSSR, setPostsFromSSR, postId, postCreated, getPosts]);

  return (
    <div className="grid grid-cols-[300px_1fr] h-screen max-h-screen">
      {/* Sidebar */}
      <div className="flex flex-col text-white overflow-hidden">
        <div className="bg-slate-800 px-2">
          <Logo />
          <Link href="/post/new" className="btn">
            New post
          </Link>
          <Link href="/token-topup" className="block mt-2 text-center">
            <FontAwesomeIcon icon={faCoins} className="text-yellow-500" />
            <span className="pl-1">{availableTokens} tokens available</span>
          </Link>
        </div>

        <div className="px-4 flex-1 overflow-auto bg-gradient-to-b from-slate-800 to-cyan-800">
          {/* Skeleton while loading */}
          {loadingSidebar ? (
            <div className="space-y-2 mt-4 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-6 bg-white/20 rounded-sm"></div>
              ))}
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <Link
                  key={post._id}
                  href={`/post/${post._id}`}
                  className={`py-1 border border-white/0 block text-ellipsis overflow-hidden whitespace-nowrap my-1 px-2 bg-white/10 cursor-pointer rounded-sm ${
                    postId === post._id ? "bg-white/20 border-white" : ""
                  }`}
                >
                  {post.topic}
                </Link>
              ))}

              {!noMorePosts && posts.length > 0 ? (
                <div
                  onClick={() =>
                    getPosts({ lastPostDate: posts[posts.length - 1].created })
                  }
                  className="underline text-sm font-semibold text-blue-400 text-center cursor-pointer mt-4"
                >
                  Load more posts
                </div>
              ) : (
                <div className="text-sm font-semibold text-slate-400 text-center mt-4">
                  No more posts
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-cyan-800 flex items-center gap-2 border-t border-t-black/50 h-20 px-2">
          {!!user ? (
            <>
              <div className="min-w-[50px]">
                <Image
                  src={user.picture || "/favicon.png"}
                  alt={user.name}
                  height={50}
                  width={50}
                  className="rounded-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/favicon.png";
                  }}
                />
              </div>
              <div className="flex-1">
                <div className="font-bold">{user.email}</div>
                <Link
                  className="text-sm text-red-200 hover:text-red-400 transition-colors"
                  href="/api/auth/logout"
                >
                  <FontAwesomeIcon
                    icon={faCoins}
                    className="mr-1 text-yellow-400"
                  />
                  Logout
                </Link>
              </div>
            </>
          ) : (
            <Link href="/api/auth/login">Login</Link>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};
