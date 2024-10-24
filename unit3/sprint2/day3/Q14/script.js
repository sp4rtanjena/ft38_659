function showTab(tabId) {
    document.getElementById('development').classList.add('hidden');
    document.getElementById('analytics').classList.add('hidden');

    document.querySelector('.tabs button.active').classList.remove('active');
    event.target.classList.add('active');

    document.getElementById(tabId).classList.remove('hidden');
}