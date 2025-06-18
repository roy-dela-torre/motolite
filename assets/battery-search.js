class BatterySearchFilterOption {
    element;
    value;

      constructor(optionValue) {
      this.element = document.createElement("option");
      this.element.value = optionValue;
      this.element.text = optionValue;
      this.value = optionValue;
    }
}

class BatterySearchVehicleCategoryOption extends BatterySearchFilterOption {
    manufacturerOptions;

  constructor(category) {
      super(category);

    this.manufacturerOptions = [];
    }
}

class BatterySearchVehicleManufacturerOption extends BatterySearchFilterOption {
    modelOptions;
    
    constructor(manufacturer) {
      super(manufacturer);

      this.modelOptions = [];
    }
}

class BatterySearchVehicleModelOption extends BatterySearchFilterOption {
    trimOptions;

    constructor(model) {
      super(model);

    this.trimOptions = [];

    }
}

class BatterySearchVehicleTrimOption extends BatterySearchFilterOption {
    modelYearOptions;
    
    constructor(trim) {
        super(trim);

    this.modelYearOptions = [];
  }
}

class BatterySearchVehicleModelYearOption extends BatterySearchFilterOption {
    constructor(from, to) {
      if (to === null) {
        super(from);
}
    else {
        super(`${from} - ${to}`);
}

    this.value = { from: from, to: to };
    }
}

class BatterySearchFilter {
element;
defaultOption;
options;
selectedOption;
change;

constructor(filterElement, filterDefaultOption) {
    this.element = filterElement;
    this.element.onchange = (event) => this.onElementValueChange(event);
    
    this.defaultOption = filterDefaultOption;
    
    this.element.append(filterDefaultOption.element);
    this.element.value = filterDefaultOption.value;
    
    this.options = [filterDefaultOption];
    this.selectedOption = filterDefaultOption;
    this.change = null;
}

onElementValueChange(event) {
    this.selectedOption = this.options[event.target.selectedIndex];
    
    this.onChange(this);
}

onChange(sender) {
    if (this.change !== null) {
    this.change(sender);
  }
}

enable() {
    this.element.disabled = false;
}

disable() {
    this.element.disabled = true;
    this.element.value = this.defaultOption.value;
    this.selectedOption = this.defaultOption;
}

removeOptions() {
    this.element.value = this.defaultOption.value;
    let elementOptions = this.element.options;
    let elementOptionCount = elementOptions.length;

    if (elementOptionCount > 1) {
    for (let index = elementOptionCount - 1; index > 0; index--) {
    let elementOption = elementOptions[index];
    
    if (!elementOption.selected) {
    this.element.remove(elementOption.index);
  }
}

    this.options = [this.defaultOption];
    }
}

setOptions(filterOptions) {
    this.removeOptions();
    
    let filterOptionCount = filterOptions.length;
    
    for (let index = 0; index < filterOptionCount; index++) {
    let filterOption = filterOptions[index];
    
    this.element.add(filterOption.element);
    this.options.push(filterOption);
      }
   }
}

class BatterySearchFilterOptionListBuilder {
options;

constructor(vehicles) {
      this.options = [];
      let vehicleCount = vehicles.length;
      
      for (let index = 0; index < vehicleCount; index++) {
      let vehicle = vehicles[index];
      
      let categoryOption = this.addVehicleCategoryOption(vehicle.category, this.options);
      let manufacturerOption = this.addVehicleManufacturerOption(vehicle.manufacturer, categoryOption.manufacturerOptions);
      let modelOption = this.addVehicleModelOption(vehicle.model, manufacturerOption.modelOptions);
      let trimOption = this.addVehicleTrimOption(vehicle.trim, modelOption.trimOptions);
      
      this.addVehicleModelYearOption(vehicle.modelYearFrom, vehicle.modelYearTo, trimOption.modelYearOptions);
}
}

addVehicleCategoryOption(value, optionList) {
let option = optionList.find(o => o.value === value);

if (option === undefined) {
option = new BatterySearchVehicleCategoryOption(value);

optionList.push(option);
}

return option;
}

addVehicleManufacturerOption(value, optionList) {
    let option = optionList.find(o => o.value === value);

      if (option === undefined) {
      option = new BatterySearchVehicleManufacturerOption(value);
      
      optionList.push(option);
  }

return option;
}

addVehicleModelOption(value, optionList) {
let option = optionList.find(o => o.value === value);

if (option === undefined) {
option = new BatterySearchVehicleModelOption(value);

optionList.push(option);
}

return option;
}

addVehicleTrimOption(value, optionList) {
let option = optionList.find(o => o.value === value);

if (option === undefined) {
option = new BatterySearchVehicleTrimOption(value);

optionList.push(option);
}

return option;
}

addVehicleModelYearOption(from, to, optionList) {
let option = optionList.find(o => o.value.from === from && o.value.to === to);

if (option === undefined) {
option = new BatterySearchVehicleModelYearOption(from, to);

optionList.push(option);
}

return option;
}
}

class BatterySearch {
element;
filterOptions;
vehicleCategoryFilter;
vehicleManufacturerFilter;
vehicleModelFilter;
vehicleTrimFilter;
vehicleModelYearFilter;
searchButton;

constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.initializeVehicleCategoryFilter();
        this.initializeVehicleManufacturerFilter();
        this.initializeVehicleModelFilter();
        this.initializeVehicleTrimFilter();
        this.initializeVehicleModelYearFilter();
        this.initializeSearchButton();
        this.initializeFilterOptions().then(() => {
        this.vehicleCategoryFilter.setOptions(this.filterOptions);
        this.vehicleCategoryFilter.enable();

});
}

initializeFilterOptions() {
      return new Promise((resolve, reject) => {
      const sessionStorageKey = "vehicleList";
      let vehicleJsonList = sessionStorage.getItem(sessionStorageKey);

        if (vehicleJsonList === null) {
        fetch("https://green-ground-0e4988d00.1.azurestaticapps.net/api/GetSupportedVehicles").then(response => {
        if (response.ok) {
        response.json().then(vehicles => {
        sessionStorage.setItem(sessionStorageKey, JSON.stringify(vehicles));
        
        this.filterOptions = new BatterySearchFilterOptionListBuilder(vehicles).options;

  resolve();
});
  }
else {
    reject();
}
});
}
else {
this.filterOptions = new BatterySearchFilterOptionListBuilder(JSON.parse(vehicleJsonList)).options;

resolve();
}
});
}

initializeVehicleCategoryFilter() {
this.vehicleCategoryFilter = new BatterySearchFilter(this.element.querySelector("#vehicleCategoryFilter"), new BatterySearchFilterOption("Category*"));
this.vehicleCategoryFilter.change = (sender) => this.onVehicleCategoryFilterValueChange(sender);
}

initializeVehicleManufacturerFilter() {
this.vehicleManufacturerFilter = new BatterySearchFilter(this.element.querySelector("#vehicleManufacturerFilter"), new BatterySearchFilterOption("Manufacturer*"));
this.vehicleManufacturerFilter.change = (sender) => this.onVehicleManufacturerFilterValueChange(sender);
}

initializeVehicleModelFilter() {
this.vehicleModelFilter = new BatterySearchFilter(this.element.querySelector("#vehicleModelFilter"), new BatterySearchFilterOption("Model*"));
this.vehicleModelFilter.change = (sender) => this.onVehicleModelFilterValueChange(sender);
}

initializeVehicleTrimFilter() {
this.vehicleTrimFilter = new BatterySearchFilter(this.element.querySelector("#vehicleTrimFilter"), new BatterySearchFilterOption("Variant"));
this.vehicleTrimFilter.change = (sender) => this.onVehicleTrimFilterValueChange(sender);
}

initializeVehicleModelYearFilter() {
this.vehicleModelYearFilter = new BatterySearchFilter(this.element.querySelector("#vehicleModelYearFilter"), new BatterySearchFilterOption("Year"));
}

initializeSearchButton() {
this.searchButton = this.element.querySelector("#searchButton");
this.searchButton.disabled = true;
this.searchButton.onclick = () => this.onSearchButtonClick();
}

onVehicleCategoryFilterValueChange(sender) {
if (sender.selectedOption.value === sender.defaultOption.value) {
this.vehicleManufacturerFilter.disable();
this.vehicleModelFilter.disable();
this.vehicleTrimFilter.disable();
this.vehicleModelYearFilter.disable();

this.searchButton.disabled = true;
}
else {
this.vehicleManufacturerFilter.setOptions(sender.selectedOption.manufacturerOptions);
this.vehicleManufacturerFilter.enable();
}
}

onVehicleManufacturerFilterValueChange(sender) {
if (sender.selectedOption.value === sender.defaultOption.value) {
this.vehicleModelFilter.disable();
this.vehicleTrimFilter.disable();
this.vehicleModelYearFilter.disable();

this.searchButton.disabled = true;
}
else {
this.vehicleModelFilter.setOptions(sender.selectedOption.modelOptions);
this.vehicleModelFilter.enable();
}
}

onVehicleModelFilterValueChange(sender) {
if (sender.selectedOption.value === sender.defaultOption.value) {
this.vehicleTrimFilter.disable();
this.vehicleModelYearFilter.disable();

this.searchButton.disabled = true;
}
else {
this.vehicleTrimFilter.setOptions(sender.selectedOption.trimOptions);
this.vehicleTrimFilter.enable();

this.searchButton.disabled = false;
}
}

onVehicleTrimFilterValueChange(sender) {
if (sender.selectedOption.value === sender.defaultOption.value) {
this.vehicleModelYearFilter.disable();
}
else {
this.vehicleModelYearFilter.setOptions(sender.selectedOption.modelYearOptions);
this.vehicleModelYearFilter.enable();
}
}

onSearchButtonClick() {
      let urlSearchParams = new URLSearchParams();
      urlSearchParams.append("category", this.vehicleCategoryFilter.selectedOption.value);
      urlSearchParams.append("manufacturer", this.vehicleManufacturerFilter.selectedOption.value);
      urlSearchParams.append("model", this.vehicleModelFilter.selectedOption.value);


      if (this.vehicleTrimFilter.selectedOption.value !== this.vehicleTrimFilter.defaultOption.value)
      {
      urlSearchParams.append("trim", this.vehicleTrimFilter.selectedOption.value);
      }
      
      if (this.vehicleModelYearFilter.selectedOption.value.from !== undefined && this.vehicleModelYearFilter.selectedOption.value.from !== null) {
      urlSearchParams.append("modelYearFrom", this.vehicleModelYearFilter.selectedOption.value.from);
      }
      
      if (this.vehicleModelYearFilter.selectedOption.value.to !== undefined && this.vehicleModelYearFilter.selectedOption.value.to !== null) {
      urlSearchParams.append("modelYearTo", this.vehicleModelYearFilter.selectedOption.value.to);
      }
      
      window.location.assign(`/pages/search-result?${urlSearchParams.toString()}`);
      }
      }