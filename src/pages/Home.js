export default function Home() {
  return (
    <div style={{ height: "100vh" }}>
      <iframe
        src="/cv.pdf"
        width="100%"
        height="100%"
        style={{ border: "none" }}
        title="CV"
      />
    </div>
  );
}
