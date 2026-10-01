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
  return (
    <div className="app">
      <header>
        <h1>Social Media Correlator</h1>
        <p>Analyze what drives social media engagement.</p>
      </header>

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