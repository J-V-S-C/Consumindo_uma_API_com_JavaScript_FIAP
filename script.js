const form = document.getElementById("holidayForm")
const yearInput = document.getElementById("yearInput")
const button = document.getElementById("sendButton")
const holidayList = document.getElementById("holidayList")
const holidayYear = document.getElementById("holydaysYear")
const holidayCount = document.getElementById("holidayCount")
const statusMessage = document.getElementById("statusMessage")

const states = {
  empty: document.getElementById("emptyState"),
  loading: document.getElementById("loadingState"),
  results: document.getElementById("results"),
  error: document.getElementById("errorState"),
}

form.addEventListener("submit", loadData)

async function loadData(event) {
  event.preventDefault()

  if (button.disabled || !form.reportValidity()) return

  const year = yearInput.value.trim()

  button.disabled = true
  showState("loading")

  try {
    const response = await fetch(
      `https://brasilapi.com.br/api/feriados/v1/${year}`,
    )

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`)
    }

    const holidays = await response.json()

    holidayList.replaceChildren(
      ...holidays.map(createHolidayCard),
    )

    holidayYear.textContent = `Feriados de ${year}`

    holidayCount.textContent =
      `${holidays.length} ${holidays.length === 1 ? "feriado" : "feriados"}`

    document.getElementById("noHolidays").hidden =
      holidays.length !== 0

    showState("results")

    statusMessage.textContent =
      `${holidayCount.textContent} encontrados para ${year}.`
  } catch (error) {
    document.getElementById("errorMessage").textContent =
      "Não foi possível carregar os feriados. Verifique sua conexão e tente novamente."

    console.error(error)
    showState("error")
  } finally {
    button.disabled = false
  }
}

function showState(active) {
  for (const [name, element] of Object.entries(states)) {
    element.hidden = name !== active
  }

  document.getElementById("showCountry").setAttribute(
    "aria-busy",
    String(active === "loading"),
  )

  statusMessage.textContent =
    active === "loading" ? "Consultando feriados…" : ""
}

function createHolidayCard(holiday) {
  const [year, month, day] = holiday.date.split("-")

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
  )

  const card = document.createElement("article")
  card.className = "holiday-card"

  card.innerHTML = `
    <time class="date-box">
      <span class="date-month"></span>
      <span class="date-day"></span>
    </time>

    <div class="holiday-info">
      <h3></h3>
      <p></p>
    </div>

    <span class="holiday-type"></span>
  `

  card.querySelector("time").dateTime = holiday.date

  card.querySelector(".date-month").textContent = date
    .toLocaleDateString("pt-BR", { month: "short" })
    .replace(".", "")
    .toUpperCase()

  card.querySelector(".date-day").textContent = day
  card.querySelector("h3").textContent = holiday.name

  card.querySelector("p").textContent =
    `${date.toLocaleDateString("pt-BR", { weekday: "long" })} · ${date.toLocaleDateString("pt-BR")}`

  card.querySelector(".holiday-type").textContent =
    holiday.type === "national"
      ? "Nacional"
      : holiday.type || "Feriado"

  return card
}
