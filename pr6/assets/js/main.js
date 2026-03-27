import { getBreeds, getDogImageByBreed } from "./api.js";
const breedSelect = document.getElementById("breedSelect");
const loadDogButton = document.getElementById("loadDogButton");
const statusText = document.getElementById("status");
const dogImage = document.getElementById("dogImage");
const dogTitle = document.getElementById("dogTitle");
const dogBreedText = document.getElementById("dogBreedText");
document.addEventListener("DOMContentLoaded", () => {
    void loadBreeds();
    loadDogButton?.addEventListener("click", () => {
        const breed = breedSelect?.value ?? "";
        if (!breed) {
            setStatus("Спочатку оберіть породу.");
            return;
        }
        void loadDogByBreed(breed);
    });
});
async function loadBreeds() {
    if (!breedSelect)
        return;
    setStatus("Завантаження списку порід...");
    breedSelect.disabled = true;
    try {
        const breeds = await getBreeds();
        breedSelect.innerHTML = '<option value="">Оберіть породу</option>';
        breeds.forEach((breed) => {
            const option = document.createElement("option");
            option.value = breed;
            option.textContent = capitalizeFirstLetter(breed);
            breedSelect.appendChild(option);
        });
        breedSelect.disabled = false;
        setStatus("Список порід завантажено.");
    }
    catch (error) {
        setStatus("Не вдалося завантажити список порід. Спробуйте пізніше.");
        console.error(error);
    }
}
async function loadDogByBreed(breed) {
    setStatus("Завантаження фото...");
    try {
        const imageUrl = await getDogImageByBreed(breed);
        showDog(imageUrl, `Порода: ${capitalizeFirstLetter(breed)}`);
        setStatus("Фото успішно завантажено.");
    }
    catch (error) {
        setStatus("Не вдалося завантажити фото. Спробуйте ще раз.");
        console.error(error);
    }
}
function showDog(imageUrl, title) {
    if (!dogImage || !dogTitle || !dogBreedText)
        return;
    dogImage.src = imageUrl;
    dogImage.hidden = false;
    dogTitle.textContent = title;
    dogBreedText.textContent = "";
}
function setStatus(message) {
    if (statusText) {
        statusText.textContent = message;
    }
}
function capitalizeFirstLetter(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
