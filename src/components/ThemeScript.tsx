import Script from "next/script";

export default function ThemeScript() {
  return (
    <Script id="theme-script" strategy="beforeInteractive">
      {`
(function(){
  try {
    var STORAGE_KEY = 'theme';
    var saved = localStorage.getItem(STORAGE_KEY);
    var system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var theme = saved || system;
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) { /* no-op */ }
})();
      `}
    </Script>
  );
}
