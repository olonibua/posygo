(() => {
  const API_URL = document.body.dataset.apiUrl;
  const view = document.getElementById("view");
  const countryNames = new Intl.DisplayNames(["en-GB"], { type: "region" });
  const OUTCOMES = {
    ACCEPTED: ["With the hub", "info"],
    FULFILLED: ["Shipped", "success"],
    REJECTED: ["Sent back to you", "critical"],
    CLOSED: ["Sent back to you", "critical"],
    CANCELLED: ["Cancelled", "neutral"],
  };

  function el(tag, attributes, ...children) {
    const node = document.createElement(tag);
    for (const [name, value] of Object.entries(attributes ?? {})) {
      if (name.startsWith("on")) node.addEventListener(name.slice(2), value);
      else if (value !== false && value != null) node.setAttribute(name, value === true ? "" : value);
    }
    for (const child of children.flat()) if (child != null && child !== false) node.append(child);
    return node;
  }

  function show(...nodes) {
    view.replaceChildren(...nodes.filter(Boolean));
  }

  function countryName(code) {
    return countryNames.of(code) ?? code;
  }

  function banner(message, tone = "critical") {
    return el("div", { class: `banner ${tone}`, role: tone === "critical" ? "alert" : "status" }, message);
  }

  class RequestError extends Error {
    constructor(message, fieldErrors) {
      super(message);
      this.fieldErrors = fieldErrors ?? {};
    }
  }

  async function request(path, body) {
    const token = await shopify.idToken();
    let response;
    try {
      response = await fetch(`${API_URL}/v1/shopify/${path}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });
    } catch {
      throw new RequestError("Couldn't reach Posygo. Check your connection and try again.");
    }
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const fields = Object.values(payload.fieldErrors ?? {}).flat();
      throw new RequestError(fields[0] ?? payload.message ?? "Something went wrong. Try again.", payload.fieldErrors);
    }
    return payload;
  }

  function busy(button, working) {
    button.disabled = working;
    button.setAttribute("aria-busy", String(working));
  }

  function renderConnect(problem) {
    const keyInput = el("input", { id: "api-key", name: "apiKey", type: "password", autocomplete: "off", spellcheck: "false", placeholder: "gfn_live_…", required: true });
    const check = el("button", { type: "submit", class: "primary" }, "Check key");
    const form = el(
      "form",
      { class: "card", onsubmit: (event) => preview(event, keyInput, check) },
      el("h2", {}, "Connect your Posygo account"),
      el("ol", { class: "steps" },
        el("li", {}, "Sign in at posygo.com and open Integrations."),
        el("li", {}, "Create an API key and copy it."),
        el("li", {}, "Paste it below."),
      ),
      el("label", { for: "api-key" }, "API key"),
      keyInput,
      problem ? banner(problem) : null,
      el("div", { class: "actions" }, check),
      el("p", { class: "soft small" }, "No account yet? ", el("a", { href: "https://posygo.com/signup", target: "_blank", rel: "noopener" }, "Create one on posygo.com"), "."),
    );
    show(form);
    keyInput.focus();
  }

  async function preview(event, keyInput, button) {
    event.preventDefault();
    busy(button, true);
    try {
      const account = await request("preview", { apiKey: keyInput.value.trim() });
      renderChooseCountry(keyInput.value.trim(), account);
    } catch (error) {
      renderConnect(error.message);
    } finally {
      busy(button, false);
    }
  }

  function renderChooseCountry(apiKey, account, problem, chosen) {
    if (account.countries.length === 0) {
      show(el("div", { class: "card" },
        el("h2", {}, `Hello, ${account.businessName}`),
        banner("Your Posygo account doesn't have a hub yet. Add a country in Posygo first, then come back here.", "warning"),
        el("div", { class: "actions" }, el("button", { type: "button", onclick: () => renderConnect() }, "Back")),
      ));
      return;
    }
    const select = el("select", { id: "country", name: "country" }, account.countries.map((code) => el("option", { value: code, selected: code === chosen }, countryName(code))));
    const connect = el("button", { type: "submit", class: "primary" }, "Connect");
    show(el(
      "form",
      { class: "card", onsubmit: (event) => submitConnect(event, apiKey, account, select, connect) },
      el("h2", {}, `Hello, ${account.businessName}`),
      el("p", {}, "Choose the hub that should send this shop's orders. We'll add Posygo as a location in Shopify."),
      el("label", { for: "country" }, "Ship from"),
      select,
      problem ? banner(problem) : null,
      el("div", { class: "actions" }, el("button", { type: "button", onclick: () => renderConnect() }, "Use another key"), connect),
    ));
  }

  async function submitConnect(event, apiKey, account, select, button) {
    event.preventDefault();
    busy(button, true);
    try {
      const shop = await request("connect", { apiKey, country: select.value });
      shopify.toast.show("Posygo is connected");
      renderShop(shop);
    } catch (error) {
      renderChooseCountry(apiKey, account, error.message, select.value);
    } finally {
      busy(button, false);
    }
  }

  function renderRecent(recent) {
    if (recent.length === 0) {
      return el("p", { class: "soft" }, "No orders yet. Paid orders for products at the Posygo location show up here.");
    }
    return el("table", {},
      el("thead", {}, el("tr", {}, el("th", { scope: "col" }, "Order"), el("th", { scope: "col" }, "Status"), el("th", { scope: "col" }, "Details"))),
      el("tbody", {}, recent.map((item) => {
        const [label, tone] = OUTCOMES[item.outcome] ?? [item.outcome, "neutral"];
        return el("tr", {},
          el("td", {}, item.orderName),
          el("td", {}, el("span", { class: `badge ${tone}` }, label)),
          el("td", { class: "soft" }, item.message),
        );
      })),
    );
  }

  function renderWaiting(waiting) {
    if (!waiting || waiting.length === 0) {
      return null;
    }
    return el("section", { class: "card attention" },
      el("h2", {}, waiting.length === 1 ? "1 order is waiting for you" : `${waiting.length} orders are waiting for you`),
      el("p", {}, "These are paid but haven't gone to the hub yet. Open each one and click Request fulfillment."),
      el("ul", { class: "waiting" }, waiting.map((order) =>
        el("li", {}, el("a", { href: `shopify://admin/orders/${order.orderId}`, target: "_top" }, `Open ${order.orderName}`)),
      )),
    );
  }

  function renderShop(shop) {
    if (!shop.connected) {
      renderConnect();
      return;
    }
    const disconnect = el("button", { type: "button", class: "critical", onclick: () => confirmDisconnect(disconnect) }, "Disconnect");
    show(
      el("section", { class: "card" },
        el("div", { class: "row" },
          el("h2", {}, "Connected"),
          el("span", { class: "badge success" }, `Ships from ${countryName(shop.country)}`),
        ),
        el("p", {}, `Orders are packed from ${shop.businessName}'s stock at the Posygo hub.`),
        el("h3", {}, "To send a product through Posygo"),
        el("ol", { class: "steps" },
          el("li", {}, "Set the product's SKU to its Posygo product code."),
          el("li", {}, "In the product's inventory, stock it at the Posygo location."),
          el("li", {}, "When an order is paid, open it in Shopify and click ", el("strong", {}, "Request fulfillment"), ". Shopify only sends it to the hub after you do."),
          el("li", {}, "The hub packs and ships it, and Shopify emails your customer the tracking."),
        ),
        el("p", { class: "soft small" }, "If the Posygo hub ships all your orders, Shopify can send them for you: Settings → General → Order processing → Automatically fulfill the order's line items."),
        el("p", { class: "small" }, el("a", { href: "/guides/posygo-shopify-guide.pdf", target: "_blank", rel: "noopener" }, "Download the step-by-step guide (PDF)"), " · ", el("a", { href: "/videos/connect-shopify.mp4", target: "_blank", rel: "noopener" }, "Watch the 80-second video")),
      ),
      renderWaiting(shop.waiting),
      el("section", { class: "card" }, el("h2", {}, "Recent orders"), renderRecent(shop.recent)),
      el("section", { class: "card quiet" },
        el("h2", {}, "Disconnect"),
        el("p", { class: "soft" }, "Removes the Posygo location from your shop. Orders already with the hub still ship."),
        el("div", { class: "actions start" }, disconnect),
      ),
    );
  }

  async function confirmDisconnect(button) {
    if (button.dataset.confirm !== "yes") {
      button.dataset.confirm = "yes";
      button.textContent = "Click again to disconnect";
      return;
    }
    busy(button, true);
    try {
      renderShop(await request("disconnect"));
      shopify.toast.show("Posygo is disconnected");
    } catch (error) {
      button.after(banner(error.message));
      busy(button, false);
    }
  }

  async function start() {
    if (typeof shopify === "undefined" || !new URLSearchParams(location.search).get("host")) {
      show(el("div", { class: "card" },
        el("h2", {}, "Open Posygo from your Shopify admin"),
        el("p", {}, "This page works inside Shopify. Install Posygo from the Shopify App Store, then open it from Apps in your admin."),
        el("p", {}, el("a", { href: "https://posygo.com/integrations/shopify" }, "How Posygo works with Shopify")),
      ));
      return;
    }
    try {
      renderShop(await request("session"));
    } catch (error) {
      show(banner(error.message));
    }
  }

  start();
})();
