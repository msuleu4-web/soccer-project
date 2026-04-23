const Hero = () => {
  return (
    <section
      className="text-center py-20 md:py-28 bg-gradient-to-b from-[rgba(240,255,248,0.5)] to-[rgba(220,255,238,0.5)] dark:from-[rgba(15,61,46,0.1)] dark:to-[rgba(15,61,46,0.5)]"
    >
      <div className="gl-container">
        <div className="inline-flex items-center gl-hero-badge text-sm font-medium px-4 py-1 rounded-full mb-6">
          <span className="mr-2">⚽</span>
          AIでサッカーをもっと楽しく
        </div>
        <h1 className="font-black gl-hero-title text-4xl md:text-5xl mb-4 leading-tight">
          世界のサッカーを、
          <br />
          <span className="gl-hero-title-accent">もっと身近に</span>
        </h1>
        <p className="text-base md:text-lg gl-hero-subtitle max-w-2xl mx-auto mb-10">
          最新ニュース、試合結果、リーグ順位をリアルタイムでお届けします。
        </p>
        <a href="#" className="gl-btn gl-btn-accent">
          最新ニュースを見る →
        </a>
      </div>
    </section>
  );
};
  
  export default Hero;