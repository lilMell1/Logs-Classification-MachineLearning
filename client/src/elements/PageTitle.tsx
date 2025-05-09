import React from "react";

interface PageTitleProps {
  title: string;
  subtitle?: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ title, subtitle }) => {
  return (
    <div style={{ marginBottom: "20px",marginTop: "10px", textAlign: "center" }}>
      <h1 style={{ fontSize: "1.8rem", margin: 0, color: "#003366" }}>{title}</h1>
      {subtitle && (
        <p style={{ fontSize: "1rem", color: "#666", marginTop: "5px" }}>{subtitle}</p>
      )}
    </div>
  );
};

export default PageTitle;
