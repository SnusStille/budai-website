BudAI video showcase asset slot

Add the short, web-ready video as:
  public/videos/budai-showcase.mp4

Then set this Vercel environment variable for the deployment:
  NEXT_PUBLIC_BUDAI_SHOWCASE_VIDEO_URL=/videos/budai-showcase.mp4

The homepage showcase section is intentionally not rendered until this value is set, so visitors never see a broken or empty video player. H.264/AAC MP4, 1080p or lower, and a compressed file are recommended. The original video was not present in the repository when this change was made.
