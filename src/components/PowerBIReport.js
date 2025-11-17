import "./PowerBI.css";

export default function PowerBIReport() {
  return (
    <div className="pbi-wrapper">
      <iframe
        title="Power BI Report"
        src="https://app.powerbi.com/view?r=eyJrIjoiZTg4MWQ2OGUtZTRjZC00YWU0LTk3MGYtYzRhMGQ2NTI0YWZkIiwidCI6ImQ0MThiYzU0LThhNjMtNGQ5MS1hMjc2LWZjNjI0ODg5NzZkMiIsImMiOjh9"
        allowFullScreen
      ></iframe>
    </div>
  );
}
