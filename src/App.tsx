import './App.css';
import { useEffect, useState } from 'react';
import { useBlocker, useSessionStorage } from "./hooks.tsx";

const ALLOWD = [
  '-',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Backspace',
];

export default function App() {
  const title = "WebHPゲージ"
  const comboLimit = 1000;
  const [maxHp, setMaxHp] = useState(100);
  const [hp, setHp] = useState(100);
  const [damage, setDamage] = useState(0);
  const [gaugeMode, setGaugeMode] = useState('full');
  const [damageTime, setDamageTime] = useState(new Date().getTime());
  const [isAnimation, setIsAnimation] = useState(false);
  const [frontGauge, setFrontGauge] = useState(100);
  const [backGauge, setBackGauge] = useState(100);
  const [fadeout, setFadeout] = useState('');
  const [isWeek, setIsWeek] = useState(false);
  const storage = useSessionStorage();

  useEffect(() => {
    globalThis.addEventListener("animationstart", () => {
      setIsAnimation(true);
    });
    globalThis.addEventListener("animationend", () => {
      setBackGauge(hp / maxHp * 100)
      setFadeout("");
      setIsAnimation(false);
    });
    const navigationEntries = performance.getEntriesByType("navigation");
    
    if (navigationEntries.length > 0 && navigationEntries[0] instanceof PerformanceNavigationTiming) {
      const navigationType = navigationEntries[0].type;
    
      if (navigationType === 'reload') {
        const data = storage.getUserData();
        const oldHp = parseInt(data.maxHp, 10);
        const oldDamage = parseInt(data.damage, 10);
        setMaxHp(oldHp);
        setHp(oldHp);
        setDamage(oldDamage);
      }
    }
  }, []);

  const changeHpNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (isNaN(newValue)) {
      e.preventDefault();
      return;
    }
    setMaxHp(`${newValue}`)
    setHp(`${newValue}`);
  };

  const changeDamageNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (isNaN(newValue)) {
      e.preventDefault();
      return;
    }
    setDamage(`${newValue}`);
  };

  const keyDownNumber = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key.match(/\d/)) {
      return;
    }
    if (ALLOWD.includes(e.key)) {
      return;
    }

    e.preventDefault();
  };

  const attack = () => {
    if (gaugeMode === "full") {
      setGaugeMode("normal");
    }
    const currentTime = new Date().getTime();
    if (currentTime - damageTime > comboLimit) {
      setBackGauge(hp / maxHp * 100);
    }
    const newHp = hp < damage ? 0 : hp - damage;
    setHp(newHp);
    setFrontGauge(newHp / maxHp * 100);
    setDamageTime(new Date().getTime());
    if (newHp / maxHp * 100 <= 30) {
      setIsWeek(true);
    }
    if (isAnimation) {
      setFadeout("");
    }
    setFadeout(" fadeout");
  };

  useBlocker(() => {
    storage.setUserData({maxHp, damage});
  }, true);

  return (
    <>
      <main>
        <h1 id="title" className="stalinist-one-regular">{title}</h1>
        <div id="counter-group">
          <div id="gauge-container">
            <div id="background">
              <div id="background-top"></div>
              <div id="background-bottom"></div>
              <div id="back-gauge" className={gaugeMode + fadeout} style={{width: backGauge + "%"}}></div>
              <div id="front-gauge" className={gaugeMode} style={{width: frontGauge + "%"}}></div>
              <div id="frame">
                <div id="triangle-tl"></div>
                <div id="triangle-tr"></div>
                <div id="triangle-bl"></div>
                <div id="triangle-br"></div>
              </div>
            </div>
          </div>
          <div id="hp-number" className="stalinist-one-regular">
            <div style={{color: isWeek ? 'red' : 'black'}}>{hp}</div> / {maxHp}
          </div>
        </div>
        <div id="btns">
          <div id="hp-group">
            <p>最大HP：</p>
            <input
              id="hp"
              type="number"
              defaultValue="100"
              onChange={changeHpNumber}
              onKeyDown={keyDownNumber}
            ></input>
          </div>
          <div id="damage-group">
            <p>受けたダメージ：</p>
            <input
              id="damage"
              type="number"
              defaultValue="5"
              onChange={changeDamageNumber}
              onKeyDown={keyDownNumber}
            ></input>
            <button
              type="button"
              onClick={attack}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
            >攻撃</button>
        </div>
      </div>
    </main>
    <footer>
      <p>&copy; 2025 raa0121</p>
      <p>
        Inspired by{" "}
        <a href="https://web-breeze.net/sf5-life-gauge/" target="_blank">
          【HTML/CSS/JS】ストリートファイターⅤ風のライフゲージ - 微風 on the web...
        </a>
      </p>
    </footer>
  </>
  );
}
