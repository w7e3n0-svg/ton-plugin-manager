import { useState } from "react";
import {
  TonConnectButton,
  useTonConnectUI,
  useTonWallet
} from "@tonconnect/ui-react";
import "./index.css";

function App() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  const [plugins, setPlugins] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [pluginAddress, setPluginAddress] = useState("");
  const [message, setMessage] = useState("");

  function deployPlugin() {
    setMessage(
      "Деплой плагина будет подключён следующим этапом"
    );
  }

  function addPlugin() {
    const address = pluginAddress.trim();

    if (!address) {
      setMessage("Введите адрес плагина");
      return;
    }

    setPlugins(function (currentPlugins) {
      return currentPlugins.concat({
        id: Date.now(),
        address: address
      });
    });

    setPluginAddress("");
    setShowAdd(false);
    setMessage("Плагин добавлен");
  }

  function removePlugin(id) {
    setPlugins(function (currentPlugins) {
      return currentPlugins.filter(function (plugin) {
        return plugin.id !== id;
      });
    });

    setMessage("Плагин удалён");
  }

  function shortAddress(address) {
    if (!address) {
      return "";
    }

    if (address.length <= 18) {
      return address;
    }

    return address.slice(0, 9) + "..." + address.slice(-7);
  }

  const walletAddress =
    wallet && wallet.account
      ? wallet.account.address
      : null;

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <div className="logoIcon">T</div>

          <div>
            <div className="logoTitle">
              TON Plugin Manager
            </div>

            <div className="logoSubtitle">
              Wallet plugin management
            </div>
          </div>
        </div>

        <TonConnectButton />
      </header>

      <main className="container">
        <section className="hero">
          <div className="heroBadge">
            TON WALLET PLUGINS
          </div>

          <h1>
            Manage your <span>TON plugins</span>
          </h1>

          <p>
            Deploy, install and remove plugins directly from
            your TON Wallet.
          </p>
        </section>

        {message && (
          <div className="notification">
            {message}
          </div>
        )}

        {!wallet ? (
          <section className="connectCard">
            <div className="bigIcon">🔗</div>

            <h2>Connect your wallet</h2>

            <p>
              Connect a compatible TON wallet to view and
              manage your plugins.
            </p>

            <TonConnectButton />
          </section>
        ) : (
          <>
            <section className="walletCard">
              <div>
                <div className="cardLabel">
                  CONNECTED WALLET
                </div>

                <div className="walletFullAddress">
                  {walletAddress}
                </div>
              </div>

              <div className="walletVersion">
                <span className="statusDot" />
                TON wallet connected
              </div>
            </section>

            <section className="actions">
              <button
                className="actionButton"
                onClick={deployPlugin}
              >
                <span>🚀</span>

                <div>
                  <strong>Деплой</strong>
                  <small>
                    Deploy new plugin
                  </small>
                </div>
              </button>

              <button
                className="actionButton"
                onClick={() => setShowAdd(true)}
              >
                <span>➕</span>

                <div>
                  <strong>Добавить</strong>
                  <small>
                    Install existing plugin
                  </small>
                </div>
              </button>
            </section>

            <section className="pluginsSection">
              <div className="sectionHeader">
                <div>
                  <h2>Ваши плагины</h2>

                  <p>
                    {plugins.length === 0
                      ? "Установленных плагинов пока нет"
                      : "Установлено плагинов: " +
                        plugins.length}
                  </p>
                </div>

                <button
                  className="smallAddButton"
                  onClick={() => setShowAdd(true)}
                >
                  + Добавить
                </button>
              </div>

              {plugins.length === 0 ? (
                <div className="emptyState">
                  <div className="emptyIcon">
                    🧩
                  </div>

                  <h3>
                    Плагинов пока нет
                  </h3>

                  <p>
                    Установите существующий плагин
                    или задеплойте новый.
                  </p>

                  <div className="emptyActions">
                    <button
                      className="primaryButton"
                      onClick={() =>
                        setShowAdd(true)
                      }
                    >
                      ➕ Добавить плагин
                    </button>

                    <button
                      className="secondaryButton"
                      onClick={deployPlugin}
                    >
                      🚀 Деплой
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pluginList">
                  {plugins.map(function (plugin) {
                    return (
                      <div
                        className="pluginCard"
                        key={plugin.id}
                      >
                        <div className="pluginIcon">
                          🧩
                        </div>

                        <div className="pluginInfo">
                          <strong>
                            TON Plugin
                          </strong>

                          <span>
                            {plugin.address}
                          </span>
                        </div>

                        <button
                          className="deleteButton"
                          onClick={() =>
                            removePlugin(
                              plugin.id
                            )
                          }
                        >
                          🗑️
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="infoGrid">
              <div className="infoCard">
                <span>1</span>

                <h3>Deploy</h3>

                <p>
                  Создайте новый плагин через
                  Wallet.
                </p>
              </div>

              <div className="infoCard">
                <span>2</span>

                <h3>Install</h3>

                <p>
                  Добавьте существующий plugin
                  address.
                </p>
              </div>

              <div className="infoCard">
                <span>3</span>

                <h3>Manage</h3>

                <p>
                  Просматривайте и удаляйте
                  плагины.
                </p>
              </div>
            </section>
          </>
        )}
      </main>

      {showAdd && (
        <div
          className="modalOverlay"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="closeButton"
              onClick={() =>
                setShowAdd(false)
              }
            >
              ×
            </button>

            <div className="modalIcon">
              ➕
            </div>

            <h2>
              Добавить плагин
            </h2>

            <p>
              Введите friendly или raw адрес
              существующего TON-плагина.
            </p>

            <input
              value={pluginAddress}
              onChange={(event) =>
                setPluginAddress(
                  event.target.value
                )
              }
              placeholder="EQ... или 0:..."
            />

            <div className="modalButtons">
              <button
                className="secondaryButton"
                onClick={() =>
                  setShowAdd(false)
                }
              >
                Отмена
              </button>

              <button
                className="primaryButton"
                onClick={addPlugin}
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      <footer>
        <span>
          TON Plugin Manager
        </span>

        <span>
          TON Connect enabled
        </span>
      </footer>
    </div>
  );
}

export default App;
