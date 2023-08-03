import fs from "fs";
import axios from "axios";
import path from "path";

const hostedLogosDir = "../hosted_logos/";

export type LandscapeJson = {
  item: null;
  name: string;
  homepage_url?: string;
  logo: string;
  twitter?: string;
  organization: {
    name: string;
  };
};

function getExistingLogos(): Set<string> {
  const files = fs.readdirSync(hostedLogosDir);
  return new Set(
    files.map((file) => {
      return file;
    })
  );
}
const existingLogos = getExistingLogos();

export async function getOrDownloadLogo(
  projectName: string,
  logo: null | any
): Promise<string> {
  // Note: we use logo.id instead of logo.filename
  // This is on purpose to avoid filename conflicts
  if (logo == null) {
    throw new Error(`Missing logo for ${projectName}`);
  }
  const filename = `${logo.id}.svg`;
  if (logo == null) {
    console.error("Missing logo for " + projectName);
    process.exit(1);
  } else if (existingLogos.has(filename)) {
    return filename;
  } else {
    const response = await axios.get(logo.url, { responseType: "arraybuffer" });
    const remoteFileType = response.headers["content-type"];
    const buffer: ArrayBuffer = await (async () => {
      if (remoteFileType === "image/bmp") {
        return encodeFormatToBase64Svg("bmp", response.data);
      } else if (remoteFileType === "image/png") {
        return encodeFormatToBase64Svg("png", response.data);
      } else if (remoteFileType === "image/jpeg") {
        return encodeFormatToBase64Svg("jpeg", response.data);
      } else if (remoteFileType === "image/svg+xml") {
        return await response.data;
      } else {
        throw new Error(
          `Unexpected filetype ${remoteFileType} for ${projectName}`
        );
      }
    })();
    await fs.promises.writeFile(
      path.join(hostedLogosDir, filename),
      Buffer.from(buffer)
    );
    existingLogos.add(filename);
    return filename;
  }
}

function encodeFormatToBase64Svg(format: string, data: Buffer): string {
  const base64Png = data.toString("base64");

  // Create the SVG string
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%">
    <image xlink:href="data:image/${format};base64,${base64Png}" width="100%" height="100%"/>
  </svg>`;

  return svg;
}
