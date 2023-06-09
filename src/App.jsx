import { useState, useRef, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import { notifications } from '@mantine/notifications';
import {
  checkUpdate,
  installUpdate,
  } from '@tauri-apps/api/updater'
import { relaunch } from '@tauri-apps/api/process'
import * as tauri_event from '@tauri-apps/api/event';
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name }));
  }

   // Updater integration

  function startInstall(newVersion) {
    notifications.show({ title: ('Installing update...', { v: newVersion }), message: ('Will relaunch afterwards'), autoClose: false });
    installUpdate().then(relaunch);
  }

  const mountID = useRef(null);
  const unlistens = useRef({});
  const RUNNING_IN_TAURI = window.__TAURI__ !== undefined;
  const color = "blue"

  // Tauri event listeners (run on mount)
  useEffect(() => {
    const thisMountID = Math.random();
    mountID.current = thisMountID;
    if (RUNNING_IN_TAURI) {
      checkUpdate().then(({ shouldUpdate, manifest }) => {
        if (shouldUpdate) {
          const { version: newVersion, body: releaseNotes } = manifest;
          notifications.show({
            title: 'Update available!',
            message: <>
              <button color={color} style={{ width: '100%' }} onClick={() => startInstall(newVersion)}>{('Install update and relaunch')}</button>
            </>,
            autoClose: false
          });
        }
      });
      // system tray
      tauri_event.listen('system-tray', ({ payload, ...eventObj }) => {
        if (mountID.current != thisMountID) {
          unlistens.current[thisMountID]();
        }
      }).then(new_unlisten => { unlistens.current[thisMountID] = new_unlisten; });
    }
    return () => mountID.current = null;
  }, []);

  return (
    <div className="container">
      <h1>Welcome to Tauri!</h1>

      <div className="row">
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>

      <p>{greetMsg}</p>
    </div>
  );
}

export default App;
