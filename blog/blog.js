(function () {
  const listRoot = document.querySelector("[data-blog-list]");
  if (!listRoot) return;

  const form = document.querySelector(".blog-search-form");
  const input = document.querySelector("#blog-search-input");
  const controls = Array.from(document.querySelectorAll("[data-filter-category]"));
  const cards = Array.from(listRoot.querySelectorAll(".blog-card"));
  const results = document.querySelector("#blog-results-count");
  const emptyState = document.querySelector("#blog-empty");

  let activeCategory = "all";

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function cardMatchesCategory(cardCategory) {
    if (activeCategory === "all") return true;
    return String(cardCategory || "")
      .split(",")
      .map((item) => item.trim())
      .includes(activeCategory);
  }

  function syncActiveControls() {
    controls.forEach((control) => {
      const isActive = control.dataset.filterCategory === activeCategory;
      control.setAttribute("aria-pressed", String(isActive));
    });
  }

  function updateResultsLabel(count) {
    if (!results) return;

    if (!count) {
      results.textContent = "Chưa có bài viết phù hợp với từ khóa hoặc danh mục bạn đang chọn.";
      return;
    }

    if (count === cards.length && activeCategory === "all" && !normalize(input?.value)) {
      results.textContent = `Hiển thị ${count} bài viết mới nhất từ Minh Tuấn Car Service.`;
      return;
    }

    results.textContent = `Tìm thấy ${count} bài viết phù hợp với nhu cầu của bạn.`;
  }

  function applyFilters() {
    const keyword = normalize(input?.value);
    let visibleCount = 0;

    cards.forEach((card) => {
      const haystack = normalize(card.dataset.search || card.textContent);
      const matchesCategory = cardMatchesCategory(card.dataset.category);
      const matchesKeyword = !keyword || haystack.includes(keyword);
      const isVisible = matchesCategory && matchesKeyword;

      card.hidden = !isVisible;
      if (isVisible) {
        visibleCount += 1;
      }
    });

    updateResultsLabel(visibleCount);
    syncActiveControls();

    if (emptyState) {
      emptyState.hidden = visibleCount > 0;
    }
  }

  controls.forEach((control) => {
    if (control.classList.contains("is-static")) return;

    control.addEventListener("click", () => {
      activeCategory = control.dataset.filterCategory || "all";
      applyFilters();
    });
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    applyFilters();
  });

  input?.addEventListener("input", applyFilters);

  applyFilters();
})();
