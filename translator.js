/* translator.js - Webpage translator implementation */

let translationsIndex = {};
let translationsProjects = {};

async function loadTranslations(/*void*/) {
	const currentPage = window.location.pathname.split('/').pop() || 'index.html';

	let translationFile;
	if (currentPage === 'index.html' || currentPage === '') {
		translationFile = 'translations-index.json';
	} else if (currentPage === 'projects.html') {
		translationFile = 'translations-projects.json';
	} else {
		translationFile = 'translations-index.json'; // Fallback
	}

	const filePath = './' + translationFile;

	try {
		console.log(`Attempting to load translations from: ${filePath}`);
		const response = await fetch(filePath);

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`HTTP error! status: ${response.status}, text: ${errorText} from ${filePath}`);
		}

		const data = await response.json();
		console.log(`Successfully loaded translations from ${filePath}:`, data);

		if (currentPage === 'index.html' || currentPage === '') {
			translationsIndex = data;
		} else if (currentPage === 'projects.html') {
			translationsProjects = data;
		}
		applyLanguage();
	} catch (error) {
		console.error("Error loading translations:", error);
	}
}

function applyLanguage(/*void*/) {
	const currentPage = window.location.pathname.split('/').pop() || 'index.html';
	const languageSelect = document.getElementById('languageSelect');
	const selectedLang = languageSelect ? languageSelect.value : localStorage.getItem('preferredLanguage') || 'en';

	let translations;
	if (currentPage === 'index.html' || currentPage === '') {
		translations = translationsIndex;
	} else if (currentPage === 'projects.html') {
		translations = translationsProjects;
	} else {
		translations = translationsIndex; // Fallback
	}

	if (!translations || !translations[selectedLang]) {
		console.warn(`No translations found for language: ${selectedLang} on page: ${currentPage}`);
		return;
	}

	document.querySelectorAll('[data-i18n]').forEach(element => {
		const key = element.getAttribute('data-i18n');
		if (translations[selectedLang][key]) {
			element.textContent = translations[selectedLang][key];
		} else {
			console.warn(`Missing translation key: "${key}" for language: "${selectedLang}" on page: ${currentPage}`);
			element.textContent = `[${key}]`; 
		}
	});

	document.documentElement.lang = selectedLang;
	localStorage.setItem('preferredLanguage', selectedLang);
}

function initTranslator(/*void*/) {
	const languageSelect = document.getElementById('languageSelect');
	if (languageSelect) {
		const savedLanguage = localStorage.getItem('preferredLanguage');
		if (savedLanguage) {
			languageSelect.value = savedLanguage;
		} else {
			const browserLang = navigator.language.split('-')[0];
			if (languageSelect.querySelector(`option[value="${browserLang}"]`)) {
				languageSelect.value = browserLang;
			} else {
				languageSelect.value = 'en';
			}
		}

		languageSelect.addEventListener('change', applyLanguage);
	} else {
		console.error("Language select element with ID 'languageSelect' not found.");
	}

	loadTranslations();
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initTranslator);
} else {
	initTranslator();
}
