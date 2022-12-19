// App.js
/* すべてのwavesを保存する状態変数を定義 */
const [allWaves, setAllWaves] = useState([]);

const getAllWaves = async () => {
  const { ethereum } = window;

  try {
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      /* コントラクトからgetAllWavesメソッドを呼び出す */
      const waves = await wavePortalContract.getAllWaves();
      /* UIに必要なのは、アドレス、タイムスタンプ、メッセージだけなので、以下のように設定 */
      const wavesCleaned = waves.map((wave) => {
        return {
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message,
        };
      });

      /* React Stateにデータを格納する */
      setAllWaves(wavesCleaned);
    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error);
  }
};

/**
 * `emit`されたイベントに反応する
 */
useEffect(() => {
  let wavePortalContract;

  const onNewWave = (from, timestamp, message) => {
    console.log("NewWave", from, timestamp, message);
    setAllWaves((prevState) => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };

  /* NewWaveイベントがコントラクトから発信されたときに、情報を受け取ります */
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    wavePortalContract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    );
    wavePortalContract.on("NewWave", onNewWave);
  }
  /*メモリリークを防ぐために、NewWaveのイベントを解除します*/
  return () => {
    if (wavePortalContract) {
      wavePortalContract.off("NewWave", onNewWave);
    }
  };
}, []);