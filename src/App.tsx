import "./App.css";
import "./App.soul.css";
import "./App.monster.css";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useBlocker, useSessionStorage } from "./hooks.tsx";

const ALLOWD = [
  "-",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Backspace",
];

const colors = [
  { color: "white", name: "白" },
  { color: "black", name: "黒" },
  { color: "#a00", name: "赤" },
  { color: "#0a0", name: "緑" },
  { color: "#00a", name: "青" },
];

type History = {
  id: number;
  beforeHp: number;
  damage: number;
  newHp: number;
};

let nextId = 0;

export default function App() {
  const title = "WebHPゲージ";
  const comboLimit = 1000;
  const [maxHp, setMaxHp] = useState(100);
  const [hp, setHp] = useState(100);
  const [damage, setDamage] = useState(0);
  const [frontGaugeMode, setFrontGaugeMode] = useState("full");
  const [backGaugeMode, setBackGaugeMode] = useState("full");
  const [damageTime, setDamageTime] = useState(new Date().getTime());
  const [isAnimation, setIsAnimation] = useState(false);
  const [frontGauge, setFrontGauge] = useState(100);
  const [backGauge, setBackGauge] = useState(100);
  const [fadeout, setFadeout] = useState("");
  const [isWeek, setIsWeek] = useState(false);
  const [mode, setMode] = useState("fight");
  const [name, setName] = useState("");
  const [history, setHistory] = useState<History[]>([{
    id: nextId,
    beforeHp: hp,
    damage: 0,
    newHp: hp,
  }]);
  const [gaugeWidth, setGaugeWidth] = useState(800);
  const [backgroundColor, setBackgroundColor] = useState("white");
  const search = useLocation().search;
  const storage = useSessionStorage();

  const query = new URLSearchParams(search);

  useEffect(() => {
    const animationEnable = () => {
      setIsAnimation(true);
    };
    const animationDisable = () => {
      setBackGauge(hp / maxHp * 100);
      setFadeout("");
      setIsAnimation(false);
    };
    globalThis.addEventListener("animationstart", animationEnable);
    globalThis.addEventListener("animationend", animationDisable);
    return () => {
      globalThis.removeEventListener("animationstart", animationEnable);
      globalThis.removeEventListener("animationend", animationDisable);
    };
  }, [hp]);

  useEffect(() => {
    const queryName = query.get("name");
    if (queryName) {
      setName(queryName);
    }
    if ("fight" == query.get("mode")) {
      clickFight();
    }
    if ("soul" == query.get("mode")) {
      clickSoul();
    }
    if ("monster" == query.get("mode")) {
      clickMonster();
    }

    const navigationEntries = performance.getEntriesByType("navigation");

    if (
      navigationEntries.length > 0 &&
      navigationEntries[0] instanceof PerformanceNavigationTiming
    ) {
      const navigationType = navigationEntries[0].type;

      if (navigationType === "reload") {
        const data = storage.getUserData();
        if (data !== undefined) {
          setMaxHp(data.maxHp);
          setHp(data.maxHp);
          setDamage(data.damage);
          if (data.name) {
            setName(data.name);
          }
          if (data.mode) {
            if ("fight" == data.mode) {
              clickFight();
            }
            if ("soul" == data.mode) {
              clickSoul();
            }
            if ("monster" == data.mode) {
              clickMonster();
            }
          }
        }
      }
    }
  }, []);

  const changeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };
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

  const changeGaugeWidth = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (isNaN(newValue)) {
      e.preventDefault();
      return;
    }
    setGaugeWidth(newValue);
  };

  const changeBackgroudColor = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBackgroundColor(e.target.value);
    document.body.style.backgroundColor = e.target.value;
    if (e.target.value == "white") {
      document.body.style.color = "black";
    }
    if (e.target.value == "black") {
      document.body.style.color = "white";
    }
    if (e.target.value == "#00a") {
      document.body.style.color = "white";
    }
  };

  const attack = () => {
    if (frontGaugeMode === "full") {
      setFrontGaugeMode("normal");
      setBackGaugeMode("");
    }
    const newHp = hp - damage;
    setHistory([...history, {
      id: ++nextId,
      beforeHp: hp,
      damage: damage,
      newHp: newHp,
    }]);
    const currentTime = new Date().getTime();
    setHp(newHp);
    if (currentTime - damageTime > comboLimit) {
      setBackGauge(hp / maxHp * 100);
    }
    if (newHp < 0) {
      setFrontGauge(0);
      setBackGauge(0);
    } else {
      setFrontGauge(newHp / maxHp * 100);
    }
    setDamageTime(new Date().getTime());
    if (newHp / maxHp * 100 <= 30) {
      setIsWeek(true);
    }
    if (isAnimation) {
      setFadeout("");
    }
    setFadeout(" fadeout");
  };

  const recover = () => {
    const newHp = hp + damage;
    setHistory([...history, {
      id: ++nextId,
      beforeHp: hp,
      damage: -damage,
      newHp: newHp,
    }]);
    setHp(newHp);
    setBackGauge(newHp / maxHp * 100);
    setFrontGauge(newHp / maxHp * 100);
    if (newHp / maxHp * 100 > 30) {
      setIsWeek(false);
    }
    if (newHp == maxHp) {
      setFrontGaugeMode("full");
      setBackGaugeMode("full");
    }
  };

  const reset = () => {
    setHp(maxHp);
    setBackGauge(100);
    setFrontGauge(100);
    setIsWeek(false);
    setFrontGaugeMode("full");
    setBackGaugeMode("full");
    nextId = 0;
    setHistory([{ id: nextId, beforeHp: hp, damage: 0, newHp: hp }]);
  };

  const clickFight = () => {
    document.body.style.backgroundColor = "white";
    document.body.style.color = "black";
    setMode("fight");
    setGaugeWidth(800);
    query.set("mode", "fight");
  };

  const clickSoul = () => {
    setMode("soul");
    document.body.style.backgroundColor = "black";
    document.body.style.color = "white";
    setGaugeWidth(600);
    query.set("mode", "soul");
  };
  const clickMonster = () => {
    setMode("monster");
    setGaugeWidth(100);
    query.set("mode", "monster");
  };

  useBlocker(() => {
    storage.setUserData({ name, mode, maxHp, damage });
  }, true);

  return (
    <>
      <main id={mode}>
        <h1
          id={mode + "-title"}
          className={mode == "fight"
            ? "stalinist-one-regular"
            : "zen-old-mincho-semibold"}
        >
          {title}
        </h1>
        <div id={mode + "-box"}>
          <p id={mode + "-name"} className="text-shadow">{name}</p>
          <div id={mode + "-counter-group"}>
            {mode == "monster" ? <div id={mode + "-hp-label"}>HP:</div> : ""}
            <div
              id={mode + "-gauge-container"}
              style={{ maxWidth: gaugeWidth + "px" }}
            >
              <div id={mode + "-background"}>
                <div id={mode + "-background-top"}></div>
                <div id={mode + "-background-bottom"}></div>
                <div
                  id={mode + "-back-gauge"}
                  className={backGaugeMode + fadeout}
                  style={{ width: backGauge + "%" }}
                >
                </div>
                <div
                  id={mode + "-front-gauge"}
                  className={frontGaugeMode + (
                    (mode == "monster" && isWeek == true) ? " hp-low" : ""
                  )}
                  style={{ width: frontGauge + "%" }}
                >
                </div>
                <div id={mode + "-frame"}>
                  <div id={mode + "-triangle-tl"}></div>
                  <div id={mode + "-triangle-tr"}></div>
                  <div id={mode + "-triangle-bl"}></div>
                  <div id={mode + "-triangle-br"}></div>
                </div>
              </div>
            </div>
            {mode != "monster"
              ? (
                <div
                  id={mode + "-hp-number"}
                  className={"text-shadow " + (mode == "fight"
                    ? "stalinist-one-regular"
                    : "zen-old-mincho-semibold")}
                >
                  <div style={{ color: isWeek ? "red" : "" }}>{hp}</div> /{" "}
                  {maxHp}
                </div>
              )
              : ""}
          </div>
          {mode == "monster"
            ? (
              <div
                id={mode + "-hp-number"}
                className={"text-shadow " + (mode == "fight"
                  ? "stalinist-one-regular"
                  : (mode == "soul" ? "zen-old-mincho-semibold" : ""))}
              >
                <div style={{ color: isWeek ? "red" : "" }}>{hp}</div>{" "}
                /{mode == "monster" ? "" : " "}
                {maxHp}
              </div>
            )
            : ""}
        </div>
        <div id={mode + "-btns"}>
          <div id={mode + "-name-group"}>
            {name != "ビーバーの王、橘紬希" && (
              <>
                <p>名前：</p>
                <input
                  id={mode + "-name-input"}
                  type="text"
                  onChange={changeName}
                  className={mode}
                  value={name}
                />
              </>
            )}
          </div>
          <div id={mode + "-hp-group"}>
            <p>最大HP：</p>
            <input
              id={mode + "-hp"}
              type="number"
              onChange={changeHpNumber}
              onKeyDown={keyDownNumber}
              className={mode == "fight" ? "fight" : "soul"}
              value={maxHp}
            />
          </div>
          <div id={mode + "-damage-group"}>
            <p>受ける/回復するダメージ：</p>
            <input
              id={mode + "-damage"}
              type="number"
              onChange={changeDamageNumber}
              onKeyDown={keyDownNumber}
              className={mode == "fight" ? "fight" : "soul"}
              value={damage}
            />
            <button
              type="button"
              onClick={attack}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
            >
              攻撃
            </button>
            <button
              type="button"
              onClick={recover}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
            >
              回復
            </button>
            <button
              id="reset"
              type="button"
              onClick={reset}
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-full w-auto"
            >
              リセット
            </button>
          </div>
          <div id={mode + "-setting-group"}>
            <div id={mode + "-gauge-width-group"}>
              <p>ゲージ幅(px)：</p>
              <input
                id={mode + "-gauge-width"}
                type="number"
                onChange={changeGaugeWidth}
                onKeyDown={keyDownNumber}
                className={mode == "fight" ? "fight" : "soul"}
                value={gaugeWidth}
              />
              <p>背景色：</p>
              <select
                id={mode + "-background-color"}
                onChange={changeBackgroudColor}
                className={mode == "fight" ? "fight" : "soul"}
                value={backgroundColor}
                defaultValue={mode == "fight" ? "white" : "black"}
              >
                {colors.map((color) => (
                  <option key={color.color} value={color.color}>
                    {color.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <button
              id="button-fight"
              type="button"
              onClick={clickFight}
              disabled={mode == "fight"}
              className="bg-gray-400 hover:bg-gray-600 disabled:bg-gray-700 text-white font-bold py-2 px-4 rounded-full"
            >
              Fight
            </button>
            <button
              id="button-soul"
              type="button"
              onClick={clickSoul}
              disabled={mode == "soul"}
              className="bg-gray-400 hover:bg-gray-600 disabled:bg-gray-700 text-white font-bold py-2 px-4 rounded-full"
            >
              Soul
            </button>
            <button
              id="button-monster"
              type="button"
              onClick={clickMonster}
              disabled={mode == "monster"}
              className="bg-gray-400 hover:bg-gray-600 disabled:bg-gray-700 text-white font-bold py-2 px-4 rounded-full"
            >
              Monster
            </button>
          </div>
        </div>

        <div id="history">
          {history.map((h) => {
            if (h.id != 0) {
              if (h.damage > 0) {
                return (
                  <p key={h.id}>
                    元HP:{h.beforeHp} ダメージ:{h.damage} 変更後HP:{h.newHp}
                  </p>
                );
              } else {
                return (
                  <p key={h.id}>
                    元HP:{h.beforeHp} 回復量:{-1 * h.damage} 変更後HP:{h.newHp}
                  </p>
                );
              }
            }
          })}
        </div>
      </main>
      <footer>
        <p>&copy; 2025 raa0121</p>
        <p>
          Inspired by{" "}
          <a href="https://web-breeze.net/sf5-life-gauge/" target="_blank">
            【HTML/CSS/JS】ストリートファイターⅤ風のライフゲージ - 微風 on the
            web...
          </a>
        </p>
        <div id="license-group">
          <p>
            monsterモードのHP表示には、<a
              href="https://github.com/nue-of-k/pkmn/"
              target="_blank"
            >
              PKMN Structフォント
            </a>から数字と{"/"}を抽出し、Webフォントに変換したものを利用しています。
          </p>
          <details>
            <summary>ライセンス全文</summary>
            <p id="license">
              PKMN Strict<br />
              <br />
              MIT License<br />
              <br />
              Copyright © 2009-2015 鵺 (Nue)<br />
              <br />
              Permission is hereby granted, free of charge, to any person
              obtaining a copy<br />
              of this software and associated documentation files (the
              "Software"), to deal<br />
              in the Software without restriction, including without limitation
              the rights<br />
              to use, copy, modify, merge, publish, distribute, sublicense,
              and/or sell<br />
              copies of the Software, and to permit persons to whom the Software
              is<br />
              furnished to do so, subject to the following conditions:<br />
              <br />
              The above copyright notice and this permission notice shall be
              included in all<br />
              copies or substantial portions of the Software.<br />
              <br />
              THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
              EXPRESS OR<br />
              IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
              MERCHANTABILITY,<br />
              FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
              SHALL THE<br />
              AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
              OTHER<br />
              LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
              ARISING FROM<br />, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR
              THE USE OR OTHER DEALINGS IN THE<br />
              SOFTWARE.
            </p>
          </details>
        </div>
      </footer>
    </>
  );
}
