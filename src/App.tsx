import './App.css';
import './App.soul.css';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useBlocker, useSessionStorage } from "./hooks.tsx";

interface QueryString {
  [key: string]: string;
}

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
  const [frontGaugeMode, setFrontGaugeMode] = useState('full');
  const [backGaugeMode, setBackGaugeMode] = useState('full');
  const [damageTime, setDamageTime] = useState(new Date().getTime());
  const [isAnimation, setIsAnimation] = useState(false);
  const [frontGauge, setFrontGauge] = useState(100);
  const [backGauge, setBackGauge] = useState(100);
  const [fadeout, setFadeout] = useState('');
  const [isWeek, setIsWeek] = useState(false);
  const [mode, setMode] = useState('fight');
  const [name, setName] = useState('');
  const search = useLocation().search;
  const storage = useSessionStorage();

  const query = new URLSearchParams(search);

  useEffect(() => {
    const animationEnable = () => {
      setIsAnimation(true);
    }
    const animationDisable = () => {
      setBackGauge(hp / maxHp * 100);
      setFadeout("");
      setIsAnimation(false);
    }
    globalThis.addEventListener("animationstart", animationEnable);
    globalThis.addEventListener("animationend", animationDisable);
    return () => {
      globalThis.removeEventListener("animationstart", animationEnable);
      globalThis.removeEventListener("animationend", animationDisable);
    }
  }, [hp]);

  useEffect(() => {
    setName(query.get('name'));
    if ("fight" == query.get('mode')) {
      clickFight();
    }
    if ("soul" == query.get('mode')) {
      clickSoul();
    }

    const navigationEntries = performance.getEntriesByType("navigation");
    
    if (navigationEntries.length > 0 && navigationEntries[0] instanceof PerformanceNavigationTiming) {
      const navigationType = navigationEntries[0].type;
    
      if (navigationType === 'reload') {
        const data = storage.getUserData();
        if (data !== undefined) {
          setMaxHp(data.maxHp);
          setHp(data.maxHp);
          setDamage(data.damage);
          if (data.name) {
            setName(data.name)
          }
          if (data.mode) {
            if ("fight" == data.mode) {
              clickFight();
            }
            if ("soul" == data.mode) {
              clickSoul();
            }
          }
        }
      }
    }
  }, []);

  const changeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }
  const changeHpNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (isNaN(newValue)) {
      e.preventDefault();
      return;
    }
    setMaxHp(newValue);
    setHp(newValue);
  };

  const changeDamageNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (isNaN(newValue)) {
      e.preventDefault();
      return;
    }
    setDamage(newValue);
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
    if (frontGaugeMode === "full") {
      setFrontGaugeMode("normal");
      setBackGaugeMode("");
    }
    const currentTime = new Date().getTime();
    const newHp = hp - damage;
    setHp(newHp);
    if (currentTime - damageTime > comboLimit) {
      setBackGauge(hp / maxHp * 100);
    }
    setFrontGauge(newHp / maxHp * 100);
    setDamageTime(new Date().getTime());
    if (newHp / maxHp * 100 <= 30) {
      setIsWeek(true);
    }
    if (isAnimation) {
      setFadeout("");
      void document.getElementById(mode + "-back-gauge").offsetWidth;
    }
    setFadeout(" fadeout");
  };

  const clickFight = () => {
    document.body.style.backgroundColor = "white";
    document.body.style.color = "black";
    setMode('fight');
    query.set('mode', 'fight');
  }

  const clickSoul = () => {
    setMode('soul');
    document.body.style.backgroundColor = "black";
    document.body.style.color = "white";
    query.set('mode', 'soul');
  }

  useBlocker(() => {
    storage.setUserData({name, mode, maxHp, damage});
  }, true);

  return (
    <>
      <main id={mode}>
        <h1 id={mode + "-title"} className={mode == "fight" ? "stalinist-one-regular" : "zen-old-mincho-semibold"}>{title}</h1>
        <p id={mode + "-name"} className="zen-old-mincho-semibold">{name}</p>
        <div id={mode + "-counter-group"}>
          <div id={mode + "-gauge-container"}>
            <div id={mode + "-background"}>
              <div id={mode + "-background-top"}></div>
              <div id={mode + "-background-bottom"}></div>
              <div id={mode + "-back-gauge"} className={backGaugeMode + fadeout} style={{width: backGauge + "%"}}></div>
              <div id={mode + "-front-gauge"} className={frontGaugeMode} style={{width: frontGauge + "%"}}></div>
              <div id={mode + "-frame"}>
                <div id={mode + "-triangle-tl"}></div>
                <div id={mode + "-triangle-tr"}></div>
                <div id={mode + "-triangle-bl"}></div>
                <div id={mode + "-triangle-br"}></div>
              </div>
            </div>
          </div>
          <div id={mode + "-hp-number"} className={mode == "fight" ? "stalinist-one-regular" : "zen-old-mincho-semibold"}>
            <div style={{color: isWeek ? 'red' : (mode == "fight" ? "black" : 'white')}}>{hp}</div> / {maxHp}
          </div>
        </div>
        <div id={mode + "-btns"}>
          <div id={mode + "-name-group"}>
            {name != "ビーバーの王、橘紬希" && <> 
              <p>名前：</p>
              <input
                id={mode + "-name-input"}
                type="text"
                onChange={changeName}
                className={ mode == "fight" ? "fight" : "soul" }
                value={name}
              ></input>
            </>}
          </div>
          <div id={mode + "-hp-group"}>
            <p>最大HP：</p>
            <input
              id={mode + "-hp"}
              type="number"
              onChange={changeHpNumber}
              onKeyDown={keyDownNumber}
              className={ mode == "fight" ? "fight" : "soul" }
              value={maxHp}
            ></input>
          </div>
          <div id={mode + "-damage-group"}>
            <p>受けたダメージ：</p>
            <input
              id={mode + "-damage"}
              type="number"
              onChange={changeDamageNumber}
              onKeyDown={keyDownNumber}
              className={ mode == "fight" ? "fight" : "soul" }
              value={damage}
            ></input>
            <button
              type="button"
              onClick={attack}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
            >攻撃</button>
          </div>
          <div>
            <button
              id={mode + "-fight"}
              type="button"
              onClick={clickFight}
              disabled={mode == "fight"}
              className="bg-gray-400 hover:bg-gray-600 disabled:bg-gray-700 text-white font-bold py-2 px-4 rounded-full"
            >Fight</button>
            <button
              id={mode + "-soul"}
              type="button"
              onClick={clickSoul}
              disabled={mode == "soul"}
              className="bg-gray-400 hover:bg-gray-600 disabled:bg-gray-700 text-white font-bold py-2 px-4 rounded-full"
            >Soul</button>
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
