export default function PowerBIReport() {
  const container = {
    position: "relative",
    width: "100%",
    paddingBottom: "56.25%", // 16:9 ratio
    height: 0,
  };

  const iframeStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    border: "none"
  };

  return (
    <div style={container}>
      <iframe
        title="Power BI Report"
        src="https://app.powerbi.com/view?r=eyJrIjoiZTg4MWQ2OGUtZTRjZC00YWU0LTk3MGYtYzRhMGQ2NTI0YWZkIiwidCI6ImQ0MThiYzU0LThhNjMtNGQ5MS1hMjc2LWZjNjI0ODg5NzZkMiIsImMiOjh9"
        frameBorder="0"
        allowFullScreen
        style={iframeStyle}
      ></iframe>
    </div>
  );
}
