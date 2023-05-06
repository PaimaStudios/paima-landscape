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
  const filename = `${logo.id}.svg`;
  if (logo == null) {
    console.error("Missing logo for " + projectName);
    process.exit(1);
  } else if (existingLogos.has(filename)) {
    return filename;
  } else {
    const response = await axios.get(logo.url, { responseType: "arraybuffer" });
    const buffer: ArrayBuffer = await response.data;
    await fs.promises.writeFile(
      path.join(hostedLogosDir, filename),
      Buffer.from(buffer)
    );
    existingLogos.add(filename);
    return filename;
  }
}
