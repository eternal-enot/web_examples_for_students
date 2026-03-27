import { getBreeds, getDogImageByBreed } from "./api.js";

const breedSelect = document.getElementById("breedSelect") as HTMLSelectElement | null;
const loadDogButton = document.getElementById("loadDogButton") as HTMLButtonElement | null;
const statusText = document.getElementById("status") as HTMLParagraphElement | null;
const dogImage = document.getElementById("dogImage") as HTMLImageElement | null;
const dogTitle = document.getElementById("dogTitle") as HTMLHeadingElement | null;
const dogBreedText = document.getElementById("dogBreedText") as HTMLParagraphElement | null;

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

async function loadBreeds(): Promise<void> {
  if (!breedSelect) return;

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
  } catch (error) {
    setStatus("Не вдалося завантажити список порід. Спробуйте пізніше.");
    console.error(error);
  }
}

async function loadDogByBreed(breed: string): Promise<void> {
  setStatus("Завантаження фото...");

  try {
    const imageUrl = await getDogImageByBreed(breed);
    showDog(imageUrl, `Порода: ${capitalizeFirstLetter(breed)}`);
    setStatus("Фото успішно завантажено.");
  } catch (error) {
    setStatus("Не вдалося завантажити фото. Спробуйте ще раз.");
    console.error(error);
  }
}

function showDog(imageUrl: string, title: string): void {
  if (!dogImage || !dogTitle || !dogBreedText) return;

  dogImage.src = imageUrl;
  dogImage.hidden = false;
  dogTitle.textContent = title;
  dogBreedText.textContent = "";
}

function setStatus(message: string): void {
  if (statusText) {
    statusText.textContent = message;
  }
}

function capitalizeFirstLetter(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
