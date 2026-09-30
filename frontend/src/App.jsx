import { useEffect, useState } from "react";

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/posts")
      .then((response) => response.json())
      .then((data) => {
        setPosts(data.posts);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching posts:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <div>
      <h1>Social Media Correlator</h1>

      <p>Total posts analyzed: {posts.length}</p>

      {posts.map((post) => (
        <div key={post.post_id}>
          <h2>{post.author}</h2>
          <p>Views: {post.views.toLocaleString()}</p>
          <p>Likes: {post.likes.toLocaleString()}</p>
          <p>Comments: {post.comments.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}

export default App;