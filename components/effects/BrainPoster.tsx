/** This is a frame captured from the SAME seeded BrainFlight renderer, not an
 * alternate SVG/model. It covers preparation/failure without changing anatomy.
 * The live first frame uses the identical pose, seed, shader and light time.
 */
export default function BrainPoster({opening=false}:{opening?:boolean}) {
  return <picture className={`brain-poster ${opening?"brain-poster-opening":"brain-poster-story"}`} data-brain-poster data-brain-model="budai-neural-43f44c9">
    <source media="(max-width:767px)" srcSet="/brain/entry-mobile.webp"/>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/brain/entry-desktop.webp" alt="" width="1440" height="1000" loading={opening?"eager":"lazy"} fetchPriority={opening?"high":"auto"} decoding="sync"/>
  </picture>;
}
