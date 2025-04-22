let clickCount = 0;

const countryInput = document.getElementById("country");
const countryCodeInput = document.getElementById("countryCode");
const myForm = document.getElementById("form");
const modal = document.getElementById("form-feedback-modal");
const clicksInfo = document.getElementById("click-count");

function handleClick() {
    clickCount++;
    clicksInfo.innerText = clickCount;
}

async function fetchAndFillCountries() {
    try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        if (!response.ok) {
            throw new Error("Błąd pobierania danych");
        }
        const data = await response.json();

        const countriesNames = data.map((country) => country.name.common);
        countryInput.innerHTML = countriesNames
            .sort()
            .map((country) => `<option value="${country}">${country}</option>`)
            .join("");

        const countriesCodes = data
            .sort((a, b) => a.name.common.localeCompare(b.name.common))
            .filter((country) => country.idd && country.idd.suffixes)
            .map((country) => {
                return {
                    name: country.name.common,
                    code: country.idd.root + country.idd.suffixes.join(""),
                };
            });

        console.log(countriesCodes);
        countriesCodes.forEach((country) => {
            let optionElem = document.createElement("option");
            optionElem.value = country.code;
            optionElem.textContent = `${country.code} (${country.name})`;
            countryCodeInput.appendChild(optionElem);
        });
    } catch (error) {
        console.error("Wystąpił błąd:", error);
    }
}

function getCountryByIP() {
    return fetch("https://get.geojs.io/v1/ip/geo.json")
        .then((response) => response.json())
        .then((data) => {
            const country = data.country;
            // TODO inject country to form and call getCountryCode(country) function
            return country;
        })
        .catch((error) => {
            console.error("Błąd pobierania danych z serwera GeoJS:", error);
        });
}

function getCountryCode(countryName) {
    const apiUrl = `https://restcountries.com/v3.1/name/${countryName}?fullText=true`;

    return fetch(apiUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Błąd pobierania danych");
            }
            return response.json();
        })
        .then((data) => {
            const countryCode =
                data[0].idd.root + data[0].idd.suffixes.join("");

            return countryCode;
        })
        .catch((error) => {
            console.error("Wystąpił błąd:", error);
        });
}

(async () => {
    // nasłuchiwania na zdarzenie kliknięcia myszką
    document.addEventListener("click", handleClick);

    const country = await getCountryByIP();

    fetchAndFillCountries().then(() => {
        const optionIndex = [...countryInput.options]
            .map((option) => option.value)
            .indexOf(country);

        if (optionIndex >= 0) {
            countryInput.value = country;
        }
    });

    getCountryCode(country).then((code) => (countryCodeInput.value = code));
})();
