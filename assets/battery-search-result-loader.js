class BatterySearchResultItemBuilder {
    #itemValue;
    #priceCurrency;

    constructor(item, priceCurrency) {
        this.#itemValue = item;
        this.#priceCurrency = priceCurrency;
    }

    createBatteryList() {
        let element = document.createElement("div");
        element.classList.add("batterySearchResultBatteryList");

        return element;
    }

    createBatteryListTitle() {
        let element = document.createElement("div");
        element.classList.add("batterySearchResultItemTitle");

        if (this.#itemValue.vehicle.trim === "No Trim") {
            element.innerHTML = `${this.#itemValue.vehicle.modelYearFrom} - ${this.#itemValue.vehicle.modelYearTo}`;
        }
        else {
            element.innerHTML = `${this.#itemValue.vehicle.trim} ${this.#itemValue.vehicle.modelYearFrom} - ${this.#itemValue.vehicle.modelYearTo}`;
        }

        return element;
    }

    createBattery(data, isRecommended) {
        let element = document.createElement("div");
        element.classList.add("battery-search-result-item-card");

        if (isRecommended) {
            let badge = document.createElement("div");
            badge.innerHTML = "Recommended";
            badge.classList.add("battery-search-result-item-recommended-badge");

            element.append(badge);
        }

        let image = document.createElement("img");
        image.src = data.imageUrl;
        image.classList.add("battery-search-result-item-image");

        element.append(image);

        let details = document.createElement("div");
        details.classList.add("battery-search-result-item-details");

        let displayName = document.createElement("a");
        displayName.innerHTML = data.name;

        displayName.href = data.storeUrl;
        displayName.classList.add("battery-search-result-item-name");

        details.append(displayName);
        
        let price = document.createElement("div");
        price.innerHTML = `${data.price} ${this.#priceCurrency}`;
        price.classList.add("battery-search-result-item-price");

        details.append(price);
        
        let description = document.createElement("div");
        description.innerHTML = data.description;
        description.classList.add("battery-search-result-item-description");

        details.append(description);
        element.append(details);

        let buyButtonContainer = document.createElement("div");
        buyButtonContainer.classList.add("battery-search-result-item-buy-button-container");

        let buyButton = document.createElement("a");
        buyButton.href = data.storeUrl;
        buyButton.innerHTML = "Buy Battery";
        buyButton.classList.add("battery-search-result-item-buy-button");

        buyButtonContainer.append(buyButton);
        element.append(buyButtonContainer);

        return element;
    }

    createElement() {
        let element = document.createElement("div");
        element.classList.add("batterySearchResultItem");

        let batteryListTitle = this.createBatteryListTitle();

        element.append(batteryListTitle);

        let batteryList = this.createBatteryList();

        let recommendedBattery = this.createBattery(this.#itemValue.recommendedBattery, true);

        batteryList.append(recommendedBattery);

        let alternativeBatteryDataList = this.#itemValue.alternativeBatteries;

        for (let index = 0; index < alternativeBatteryDataList.length; index++) {
            let alternativeBatteryData = alternativeBatteryDataList[index];
            let alternativeBattery = this.createBattery(alternativeBatteryData, false);

            batteryList.append(alternativeBattery);
        }

        element.append(batteryList);

        return element;
    }
}

class BatterySearchResultLoadingIndicator {
    #element;

    constructor() {
        this.#element = document.getElementById("batterySearchResultLoader");
    }

    hide() {
        this.#element.classList.add("hidden");
    }
}

class BatterySearchResultErrorMessage {
    #element;

    constructor() {
        this.#element = document.getElementById("batterySearchResultErrorMessage");
    }

    show() {
        this.#element.classList.remove("hidden");
    }
}

class BatterySearchResultItemList {
    #element;

    constructor(vehicleManufacturer, vehicleModel) {
        this.#element = document.getElementById("batterySearchResultItemList");
        let title = this.createTitle(vehicleManufacturer, vehicleModel);

        this.#element.append(title);
    }

createTitle(vehicleManufacturer, vehicleModel) {
    let element = document.createElement("h2");
    element.id = "batterySearchResultItemListTitle";

    // Set the inner HTML with "Search For" text and title
    element.innerHTML = `Search Results for ${vehicleManufacturer} - ${vehicleModel}`;

    return element;
}


    hide() {
        this.#element.classList.add("hidden");
    }

    show() {
        this.#element.classList.remove("hidden");
    }

    add(item) {
        this.#element.append(item);
    }
}

class BatterySearchParamsValidator {
    static validate(urlSearchParams) {
        let category = urlSearchParams.get("category");
        let manufacturer = urlSearchParams.get("manufacturer");
        let model = urlSearchParams.get("model");

        return category !== null && manufacturer !== null && model !== null;
    }
}

class BatterySearchResultLoader {
    static load(itemPriceCurrency) {
        let loadingIndicator = new BatterySearchResultLoadingIndicator();
        let errorMessage = new BatterySearchResultErrorMessage();
        let searchParams = new URL(window.location.href).searchParams;

        if (BatterySearchParamsValidator.validate(searchParams)) {
            fetch(`https://green-ground-0e4988d00.1.azurestaticapps.net/api/SearchShopifyBatteryReplacement?${searchParams.toString()}`).then(response => {
                if (response.ok) {
                    response.json().then(
                        result => {
                            if (result.length > 0) {
                                let vehicle = result[0].vehicle;
                                let itemList = new BatterySearchResultItemList(vehicle.manufacturer, vehicle.model);

                                for (let index = 0; index < result.length; index++) {
                                    let replacementData = result[index];
                                    let itemBuilder = new BatterySearchResultItemBuilder(replacementData, itemPriceCurrency);

                                    itemList.add(itemBuilder.createElement());
                                }

                                itemList.show();
                            }

                            loadingIndicator.hide();
                        });
                    }
                    else {
                        loadingIndicator.hide();
                        errorMessage.show();
                    }
                });
        }
        else {
            loadingIndicator.hide();
            errorMessage.show();
        }
    }
}