"use strict";

const breedSelect = document.getElementById("breedSelect");
const loadDogButton = document.getElementById("loadDogButton");
const statusText = document.getElementById("status");
const dogImage = document.getElementById("dogImage");
const dogTitle = document.getElementById("dogTitle");
const dogBreedText = document.getElementById("dogBreedText");

document.addEventListener("DOMContentLoaded", function () {
  loadBreeds();

  loadDogButton.addEventListener("click", function () {
    const breed = breedSelect.value;

    if (!breed) {
      setStatus("Спочатку оберіть породу.");
      return;
    }

    loadDogByBreed(breed);
  });
});

async function loadBreeds() {
  setStatus("Завантаження списку порід...");
  breedSelect.disabled = true;

  try {
    const response = await fetch("https://dog.ceo/api/breeds/list/all");
    const data = await response.json();
    const breeds = Object.keys(data.message).sort();

    breedSelect.innerHTML = '<option value="">Оберіть породу</option>';

    breeds.forEach(function (breed) {
      const option = document.createElement("option");
      option.value = breed;
      option.textContent = capitalizeFirstLetter(breed);
      breedSelect.appendChild(option);
    });

    breedSelect.disabled = false;
    setStatus("Список порід завантажено.");
  } catch (error) {
    setStatus("Не вдалося завантажити список порід. Спробуйте пізніше.");
    console.error(error);
  }
}

async function loadDogByBreed(breed) {
  setStatus("Завантаження фото...");

  try {
    const response = await fetch("https://dog.ceo/api/breed/" + breed + "/images/random");
    const data = await response.json();

    showDog({
      image: data.message,
      title: "Порода: " + capitalizeFirstLetter(breed)
    });

    setStatus("Фото успішно завантажено.");
  } catch (error) {
    setStatus("Не вдалося завантажити фото. Спробуйте ще раз.");
    console.error(error);
  }
}

function showDog(dog) {
  dogImage.src = dog.image;
  dogImage.hidden = false;
  dogTitle.textContent = dog.title;
  dogBreedText.textContent = "";
}

function setStatus(message) {
  statusText.textContent = message;
}

function capitalizeFirstLetter(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
