import { describe, expect, it } from "vitest";
import { parseYoutubeId, youtubeEmbedUrl, youtubeThumbnailUrl } from "@/lib/youtube";

const ID = "dQw4w9WgXcQ";

describe("parseYoutubeId", () => {
  it("acepta la URL de watch", () => {
    expect(parseYoutubeId(`https://www.youtube.com/watch?v=${ID}`)).toBe(ID);
  });

  it("acepta youtube.com sin www", () => {
    expect(parseYoutubeId(`https://youtube.com/watch?v=${ID}&t=30`)).toBe(ID);
  });

  it("acepta youtu.be", () => {
    expect(parseYoutubeId(`https://youtu.be/${ID}`)).toBe(ID);
  });

  it("acepta /embed/ y /shorts/", () => {
    expect(parseYoutubeId(`https://www.youtube.com/embed/${ID}`)).toBe(ID);
    expect(parseYoutubeId(`https://youtube.com/shorts/${ID}`)).toBe(ID);
  });

  it("acepta el ID suelto", () => {
    expect(parseYoutubeId(ID)).toBe(ID);
  });

  it("acepta una URL sin esquema", () => {
    expect(parseYoutubeId(`youtu.be/${ID}`)).toBe(ID);
  });

  it("rechaza entradas inválidas", () => {
    for (const bad of [null, undefined, "", "   ", "no-es-un-video", "https://vimeo.com/12345"]) {
      expect(parseYoutubeId(bad)).toBeNull();
    }
  });

  it("rechaza un ID con longitud incorrecta", () => {
    expect(parseYoutubeId("abc123")).toBeNull();
    expect(parseYoutubeId("dQw4w9WgXcQAAA")).toBeNull();
  });
});

describe("urls derivadas", () => {
  it("usa youtube-nocookie y thumbnail de hqdefault", () => {
    expect(youtubeEmbedUrl(ID)).toBe(`https://www.youtube-nocookie.com/embed/${ID}`);
    expect(youtubeThumbnailUrl(ID)).toBe(`https://i.ytimg.com/vi/${ID}/hqdefault.jpg`);
  });
});