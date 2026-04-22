const Hero = () => {
    return (
      <section className="relative bg-gradient-to-b from-slate-900 to-slate-950 text-center py-20 md:py-32">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            世界のサッカーを、もっと身近に
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-8">
            Goal Laboは、世界中の最新サッカーニュース、試合結果、順位表をリアルタイムでお届けします。
          </p>
          <a href="#" className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-transform duration-300 inline-block hover:scale-105">
            最新ニュースを見る
          </a>
        </div>
      </section>
    );
  };
  
  export default Hero;