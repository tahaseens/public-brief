import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 3,
          background: "#17231d",
          color: "#f5f2e9",
          fontFamily: "Arial, sans-serif",
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: "-0.02em",
        }}
      >
        PB
      </div>
    ),
    size,
  );
}
