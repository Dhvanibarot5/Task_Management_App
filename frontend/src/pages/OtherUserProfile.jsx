import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";

export default function OtherUserProfile() {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [userPost, setUserPost] = useState({});
  const [userPostId, setUserPostId] = useState("");
  const [viewPost, setViewPost] = useState(null);

  const [comment, setComment] = useState("");
  const [delComment, setDelComment] = useState(false);
  const [newCommentAdd, setNewCommentAdd] = useState(false);
  const { logInUser } = useContext(AuthContext);
  const [isFollow, setIsFollow] = useState(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  //get other user info
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/oUser/getUser/${id}`, {
          withCredentials: true,
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
        setUser(response.data);
      } catch (error) {
        if (error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.message);
        }
      }
    };

    // Fetch posts when component mounts
    const fetchUserPosts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/oUser/getUserPosts/${id}`, {
          withCredentials: true,
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
        setPosts(response.data);
      } catch (error) {
        if (error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.message);
        }
      }
    };

    fetchUserData();
    fetchUserPosts();
  }, [id, delComment, newCommentAdd, isFollow]);

  // get other user post
  useEffect(() => {
    if (!userPostId) {
      return;
    }
    const fetchMyPosts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/oUser/getUserPost/${userPostId}`, {
          withCredentials: true,
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
        setUserPost(response.data);
        setViewPost(true);
      } catch (error) {
        if (error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.message);
        }
      }
    };
    setDelComment(false);

    fetchMyPosts();
  }, [userPostId, viewPost, newCommentAdd, delComment, isFollow]);

  useEffect(() => {
    const checkFollow = () => {
      if (user && user.followers.includes(localStorage.getItem("id"))) {
        setIsFollow(true);
      } else {
        setIsFollow(false);
      }
    };

    checkFollow();
  }, [user, logInUser, isFollow]);

  // delete comments
  const deleteComment = async (commentId, postId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/post/deleteComment`, {
        params: {
          commentId,
          postId,
        },
        withCredentials: true,
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      toast.success(response.data.message);
      setDelComment(true);
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message);
      }
    }
  };

  // add comments
  const addComment = async (post) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/post/addComment/${post._id}`,
        { comment },
        {
          withCredentials: true,
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      setComment("");
      setNewCommentAdd(true);
      toast.success(response.data.message);
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message);
      }
    }
  };

  // follow user
  const followUser = async (postUserId) => {
    try {
      const response = await axios.get(`${BASE_URL}/follow/${postUserId}`, {
        withCredentials: true,
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      toast.success(response.data.message);
      setIsFollow(true);
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message);
      }
    }
  };

  //unfollow user
  const unfollowUser = async (postUserId) => {
    try {
      const response = await axios.get(`${BASE_URL}/unfollow/${postUserId}`, {
        withCredentials: true,
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      toast.success(response.data.message);
      setIsFollow(false);
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message);
      }
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 min-h-screen">
        <div className="container mx-auto">
          {user ? (
            <div className="pt-32 flex flex-col items-center w-2/3 lg:w-1/2 mx-auto">
              {/* Profile Header */}
              <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
                <div className="flex items-center">
                  <img className="rounded-full w-32 h-32 border-4 border-pink-100 shadow-md" src={user.image} alt="Profile" />
                  <div className="ps-5">
                    <div className="flex justify-between items-center mb-5">
                      <h1 className="text-3xl font-bold text-purple-800 me-4">@ {user.username}</h1>
                      {id != localStorage.getItem("id") && (
                        <button
                          className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                            isFollow ? "bg-rose-100 text-rose-600 hover:bg-rose-200" : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                          }`}
                          onClick={() => {
                            isFollow ? unfollowUser(user._id) : followUser(user._id);
                          }}
                        >
                          {isFollow ? "Unfollow" : "Follow"}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center space-x-6">
                      <p className="text-sm text-gray-600 font-semibold">
                        <span className="text-purple-600">{posts.length || 0}</span> Posts
                      </p>
                      <p className="text-sm text-gray-600 font-semibold">
                        <span className="text-purple-600">{user.followers.length || 0}</span> Followers
                      </p>
                      <p className="text-sm text-gray-600 font-semibold">
                        <span className="text-purple-600">{user.following.length || 0}</span> Following
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="w-full mx-auto my-8 border-purple-100" />

              {/* Posts Grid */}
              <div className="flex flex-wrap gap-2">
                {posts.map((post) => (
                  <div key={post._id} className="w-1/3 p-1">
                    <div
                      onClick={() => setUserPostId(post._id)}
                      className="rounded-lg overflow-hidden border border-purple-100 hover:shadow-md transition-all duration-300 cursor-pointer"
                    >
                      <img className="w-full h-full object-cover" src={post.image} alt="" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full h-screen flex justify-center items-center">
              <p className="text-purple-600 text-2xl font-semibold">Loading...</p>
            </div>
          )}
        </div>

        {/* Post Modal */}
        {viewPost && (
          <div className="fixed inset-0 bg-purple-900/30 backdrop-blur-sm">
            <div className="w-[80%] xl:w-[60%] h-[70%] mt-[8%] mx-auto bg-white rounded-xl shadow-lg flex overflow-hidden">
              <div className="w-full bg-gray-100">
                <img className="w-full h-full object-cover" src={userPost.image} alt="" />
              </div>
              <div className="flex flex-col w-full">
                {/* Modal Header */}
                <div className="flex items-center p-4 border-b border-purple-100">
                  <img className="w-10 h-10 rounded-full border-2 border-purple-100" src={userPost.user.image} alt="" />
                  <span className="font-semibold text-purple-800 ml-3">@ {userPost.user.username}</span>
                </div>

                {/* Comments Section */}
                <div className="h-[76%] overflow-y-auto px-4">
                  {userPost.comments.length > 0 ? (
                    userPost.comments.map((comment, index) => (
                      <div className="py-3 flex items-center justify-between" key={index}>
                        <p className="text-gray-700">
                          <span className="font-bold text-purple-700 me-2">@ {comment.user.username} : </span>
                          {comment.comment}
                        </p>
                        {comment.user._id == logInUser._id && (
                          <button className="text-rose-500 hover:text-rose-600" onClick={() => deleteComment(comment._id, userPost._id)}>
                            <span className="material-symbols-outlined">close</span>
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex justify-center items-center">
                      <p className="text-gray-500">No Comments Yet</p>
                    </div>
                  )}
                </div>

                {/* Comment Form */}
                <div className="flex items-center p-4 border-t border-purple-100">
                  <span className="material-symbols-outlined text-purple-400">mood</span>
                  <input
                    className="mx-3 w-full px-4 py-2 rounded-full border border-purple-100 focus:outline-none focus:border-purple-300"
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add Comments..."
                  />
                  <button onClick={() => addComment(userPost)} className="px-4 py-2 text-purple-600 font-semibold hover:text-purple-700">
                    Post
                  </button>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              className="fixed top-5 right-5 text-white hover:text-purple-200 transition-colors"
              onClick={() => {
                setViewPost(false);
                setUserPostId("");
              }}
            >
              <span className="material-symbols-outlined text-4xl">close</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
