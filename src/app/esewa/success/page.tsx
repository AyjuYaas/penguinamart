// app/esewa/success/page.js
import dynamic from "next/dynamic";

const EsewaSuccessPage = dynamic(() => import("./EsewaSuccessClient"), {
  ssr: false,
});

export default EsewaSuccessPage;
