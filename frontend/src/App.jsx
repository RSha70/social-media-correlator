import { useEffect, useState } from "react";
import "./App.css";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function App() {
  const [posts, setPosts] = useState([]);
  const [correlations, setCorrelations] = useState(null);
  const [loading, setLoading] = useState(true);
   const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [batchUrls, setBatchUrls] = useState([""]);
const [batchAnalyzing, setBatchAnalyzing] = useState(false);
const [batchError, setBatchError] = useState("");
  useEffect(() => {
  Promise.all([
    fetch("http://127.0.0.1:8000/posts").then((response) =>
      response.json()
    ),
    fetch("http://127.0.0.1:8000/correlations").then((response) =>
      response.json()
    ),
  ])
    .then(([postsData, correlationData]) => {
      setPosts(postsData.posts);
      setCorrelations(correlationData.correlations);
      setLoading(false);
    })
    .catch((error) => {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    });
}, []);

  if (loading) {
    return <div className="app">Loading...</div>;
  }

  const totalViews = posts.reduce((sum, post) => sum + post.views, 0);
  const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
  const totalComments = posts.reduce(
    (sum, post) => sum + post.comments,
    0
  );
  const averageEngagement =
  posts.length > 0
    ? posts.reduce(
        (sum, post) => sum + post.engagement_rate,
        0
      ) / posts.length
    : 0;
  
  const engagementData = posts.map((post) => ({
  views: post.views,
  engagement: post.engagement_rate * 100,
  author: post.author,
}));
  const analyzeVideo = async (event) => {
  event.preventDefault();

  if (!url.trim()) {
    setError("Please enter a YouTube URL.");
    return;
  }

  setAnalyzing(true);
  setError("");

  try {
    const response = await fetch("http://127.0.0.1:8000/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || "Failed to analyze video.");
    }

    setUrl("");

    const postsResponse = await fetch(
      "http://127.0.0.1:8000/posts"
    );
    const postsData = await postsResponse.json();

    const correlationsResponse = await fetch(
      "http://127.0.0.1:8000/correlations"
    );
    const correlationsData = await correlationsResponse.json();

    setPosts(postsData.posts);
    setCorrelations(correlationsData.correlations);
  } catch (error) {
    console.error("Error analyzing video:", error);
    setError(error.message);
  } finally {
    setAnalyzing(false);
  }
};
  const analyzeBatch = async (event) => {
  event.preventDefault();

  const urls = batchUrls
    .map((item) => item.trim())
    .filter((item) => item !== "");

  if (urls.length === 0) {
    setBatchError("Add at least one YouTube URL.");
    return;
  }

  setBatchAnalyzing(true);
  setBatchError("");

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/analyze/batch",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ urls }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Failed to analyze videos.");
    }

    if (data.posts?.some((post) => post.error)) {
      const failedPosts = data.posts.filter((post) => post.error);

      if (failedPosts.length > 0) {
        setBatchError(
          `${failedPosts.length} video(s) could not be analyzed.`
        );
      }
    }

    const postsResponse = await fetch(
      "http://127.0.0.1:8000/posts"
    );
    const postsData = await postsResponse.json();

    const correlationsResponse = await fetch(
      "http://127.0.0.1:8000/correlations"
    );
    const correlationsData = await correlationsResponse.json();

    setPosts(postsData.posts);
    setCorrelations(correlationsData.correlations);
    setBatchUrls([""]);
  } catch (error) {
    console.error("Error analyzing batch:", error);
    setBatchError(error.message);
  } finally {
    setBatchAnalyzing(false);
  }
};
const addBatchUrl = () => {
  setBatchUrls([...batchUrls, ""]);
};
const updateBatchUrl = (index, value) => {
  const updatedUrls = [...batchUrls];
  updatedUrls[index] = value;
  setBatchUrls(updatedUrls);
};
  return (
    <div className="app">
      <header>
        <h1>Social Media Correlator</h1>
        <p>Analyze what drives social media engagement.</p>
      </header>

      <section className="analyze-section">
  <h2>Analyze a YouTube Video</h2>

  <form onSubmit={analyzeVideo} className="analyze-form">
    <input
      type="url"
      placeholder="Paste a YouTube URL..."
      value={url}
      onChange={(event) => setUrl(event.target.value)}
      disabled={analyzing}
    />

    <button type="submit" disabled={analyzing}>
      {analyzing ? "Analyzing..." : "Analyze Video"}
    </button>
  </form>

  {error && <p className="error-message">{error}</p>}
</section>

<section className="batch-section">
  <h2>Analyze Multiple Videos</h2>

  <form onSubmit={analyzeBatch}>
    {batchUrls.map((batchUrl, index) => (
      <input
        key={index}
        type="url"
        placeholder="Paste a YouTube URL..."
        value={batchUrl}
        onChange={(event) =>
          updateBatchUrl(index, event.target.value)
        }
        disabled={batchAnalyzing}
      />
    ))}

    <div className="batch-actions">
      <button
        type="button"
        onClick={addBatchUrl}
        disabled={batchAnalyzing}
      >
        + Add another URL
      </button>

      <button type="submit" disabled={batchAnalyzing}>
        {batchAnalyzing
          ? "Analyzing..."
          : "Analyze Videos"}
      </button>
    </div>
  </form>

  {batchError && (
    <p className="error-message">{batchError}</p>
  )}
</section>

      <section className="stats">
        <div className="stat-card">
          <span>Posts Analyzed</span>
          <strong>{posts.length}</strong>
        </div>

        <div className="stat-card">
          <span>Total Views</span>
          <strong>{totalViews.toLocaleString()}</strong>
        </div>

        <div className="stat-card">
          <span>Total Likes</span>
          <strong>{totalLikes.toLocaleString()}</strong>
        </div>

        <div className="stat-card">
  <span>Avg. Engagement</span>
  <strong>{(averageEngagement * 100).toFixed(2)}%</strong>
</div>
      </section>



      <section className="chart-section">
  <h2>Views vs. Engagement Rate</h2>

  <div className="chart-container">
    <ResponsiveContainer width="100%" height={350}>
      <ScatterChart>
        <CartesianGrid />
        <XAxis
          type="number"
          dataKey="views"
          name="Views"
          tickFormatter={(value) => value.toLocaleString()}
        />
        <YAxis
          type="number"
          dataKey="engagement"
          name="Engagement"
          unit="%"
        />
        <Tooltip
          formatter={(value, name) => [
            name === "Engagement"
              ? `${Number(value).toFixed(2)}%`
              : Number(value).toLocaleString(),
            name,
          ]}
        />
        <Scatter data={engagementData} />
      </ScatterChart>
    </ResponsiveContainer>
  </div>
</section>


<section className="correlations-section">
  <h2>Correlation Analysis</h2>
          <p className="correlation-description">
  Correlations show the strength and direction of linear relationships
  within the analyzed posts. They do not imply causation.
</p>
  {correlations ? (
    <div className="correlation-grid">
      <div className="correlation-card">
        <span>Views ↔ Likes</span>
        <strong>
          {correlations.views_vs_likes.toFixed(2)}
        </strong>
      </div>

      <div className="correlation-card">
        <span>Views ↔ Comments</span>
        <strong>
          {correlations.views_vs_comments.toFixed(2)}
        </strong>
      </div>

      <div className="correlation-card">
        <span>Views ↔ Engagement</span>
        <strong>
          {correlations.views_vs_engagement_rate.toFixed(2)}
        </strong>
      </div>

      <div className="correlation-card">
        <span>Description ↔ Engagement</span>
        <strong>
          {correlations.description_length_vs_engagement_rate.toFixed(2)}
        </strong>
      </div>

      <div className="correlation-card">
        <span>Links ↔ Engagement</span>
        <strong>
          {correlations.link_count_vs_engagement_rate.toFixed(2)}
        </strong>
      </div>

      <div className="correlation-card">
        <span>Mentions ↔ Engagement</span>
        <strong>
          {correlations.mention_count_vs_engagement_rate.toFixed(2)}
        </strong>
      </div>

      <div className="correlation-card">
        <span>Posting Hour ↔ Engagement</span>
        <strong>
          {correlations.posting_hour_vs_engagement_rate.toFixed(2)}
        </strong>
      </div>
    </div>
  ) : (
    <p>Not enough posts to calculate correlations.</p>
  )}
</section>

      <section className="posts-section">
        <h2>Analyzed Posts</h2>

        <div className="posts">
          {posts.map((post) => (
            <article className="post-card" key={post.post_id}>
              <div>
                <h3>{post.author}</h3>
                <p>{post.platform}</p>
              </div>

              <div className="post-stats">
                <span>
                  <strong>{post.views.toLocaleString()}</strong>
                  Views
                </span>

                <span>
                  <strong>{post.likes.toLocaleString()}</strong>
                  Likes
                </span>

                <span>
                  <strong>{post.comments.toLocaleString()}</strong>
                  Comments
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;