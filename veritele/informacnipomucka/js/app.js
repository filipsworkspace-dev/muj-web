var veritele = [];
    var popular = [
      'Ferratum',
      'FlexiFin',
      'Kamali',
      'Creditea',
      'Zaplo',
      'Cofidis',
      'Provident',
      'Home Credit'
    ];

    var input = document.getElementById('searchInput');
    var results = document.getElementById('results');
    var statusEl = document.getElementById('status');
    var emptyEl = document.getElementById('empty');
    var chipsEl = document.getElementById('chips');
    var chipsWrapEl = document.getElementById('chipsWrap');
    var copyToast = document.getElementById('copyToast');
    var toastTimer = null;

    function normalize(text) {
      return String(text || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    }

    function escapeHtml(text) {
      return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function highlight(text, query) {
      var raw = String(text || '');
      var safeText = escapeHtml(raw);
      var q = String(query || '').trim();

      if (!q) return safeText;

      var normalizedText = normalize(raw);
      var normalizedQuery = normalize(q);
      var index = normalizedText.indexOf(normalizedQuery);

      if (index === -1) return safeText;

      var before = escapeHtml(raw.slice(0, index));
      var match = escapeHtml(raw.slice(index, index + q.length));
      var after = escapeHtml(raw.slice(index + q.length));

      return before + '<mark>' + match + '</mark>' + after;
    }

    function toggleSuggestions(shouldHide) {
      if (!chipsWrapEl) return;

      if (shouldHide) {
        chipsWrapEl.classList.add('is-hidden');
      } else {
        chipsWrapEl.classList.remove('is-hidden');
      }
    }

    function cleanAlias(value) {
      var cleanValue = String(value || '').trim();
      var normalized = normalize(cleanValue).replace(/\s+/g, ' ');

      if (!cleanValue) {
        return '';
      }

      if (
        cleanValue === '-' ||
        cleanValue === '—' ||
        cleanValue === '–' ||
        normalized === 'ne' ||
        normalized === 'neni' ||
        normalized === 'bez aliasu' ||
        normalized === 'bez predchoziho nazvu'
      ) {
        return '';
      }

      return cleanValue;
    }

    function splitAliases(value) {
      var cleanValue = cleanAlias(value);

      if (!cleanValue) {
        return [];
      }

      return cleanValue
        .replace(/\s+\/\s+/g, ', ')
        .split(/[,;\n]+/)
        .map(function(item) {
          return item.trim();
        })
        .filter(function(item, index, array) {
          return Boolean(item) && array.indexOf(item) === index;
        });
    }

    function buildDetails(v, query, index) {
      var ico = String(v.ico || '').trim();
      var address = String(v.adresa || '').trim();
      var safeIco = escapeHtml(ico);
      var safeAddress = escapeHtml(address);

      return '' +
        '<div class="creditor-details" id="creditor-detail-' + index + '">' +
          '<div class="detail-item">' +
            '<span class="detail-label">IČO</span>' +
            '<button class="detail-copy" type="button" data-copy-text="' + safeIco + '" aria-label="Kopírovat IČO ' + safeIco + '">' +
              '<span class="detail-value"><strong>' + highlight(ico || '—', query) + '</strong></span>' +
              '<span class="detail-copy-icon" aria-hidden="true">⧉</span>' +
            '</button>' +
          '</div>' +
          '<div class="detail-item">' +
            '<span class="detail-label">Adresa</span>' +
            '<button class="detail-copy" type="button" data-copy-text="' + safeAddress + '" aria-label="Kopírovat adresu ' + safeAddress + '">' +
              '<span class="detail-value">' + highlight(address || '—', query) + '</span>' +
              '<span class="detail-copy-icon" aria-hidden="true">⧉</span>' +
            '</button>' +
          '</div>' +
        '</div>';
    }

    function buildAliasBox(value, query) {
      var cleanValue = cleanAlias(value);
      var aliases = splitAliases(cleanValue);

      if (!cleanValue) {
        return '';
      }

      if (!aliases.length) {
        return '' +
          '<div class="alias-box">' +
            '<div class="alias-label">Další obchodní názvy:</div>' +
            '<button class="alias-copy" type="button" data-copy-text="' + escapeHtml(cleanValue) + '" aria-label="Kopírovat obchodní název ' + escapeHtml(cleanValue) + '">' +
              '<span>' + highlight(cleanValue, query) + '</span>' +
            '</button>' +
          '</div>';
      }

      return '' +
        '<div class="alias-box">' +
          '<div class="alias-label">Další obchodní názvy:</div>' +
          '<div class="alias-list">' +
            aliases.map(function(alias) {
              return '' +
                '<button class="alias-copy" type="button" data-copy-text="' + escapeHtml(alias) + '" aria-label="Kopírovat obchodní název ' + escapeHtml(alias) + '">' +
                  '<span>' + highlight(alias, query) + '</span>' +
                '</button>';
            }).join('') +
          '</div>' +
        '</div>';
    }

    function renderChips() {
      chipsEl.innerHTML = '';

      popular.forEach(function(item) {
        var btn = document.createElement('button');
        btn.className = 'chip';
        btn.type = 'button';
        btn.textContent = item;

        btn.addEventListener('click', function() {
          input.value = item;
          renderResults(item);
          input.focus();
        });

        chipsEl.appendChild(btn);
      });
    }

    function getFilteredData(query) {
      var trimmedQuery = String(query || '').trim();
      var q = normalize(trimmedQuery);

      return veritele.filter(function(v) {
        var text = normalize(
          (v.nazev || '') + ' ' +
          (v.ico || '') + ' ' +
          (v.aliasy || '') + ' ' +
          (v.adresa || '')
        );

        return !q || text.indexOf(q) !== -1;
      });
    }

    function renderResults(query) {
      query = query || '';

      var trimmedQuery = query.trim();
      var filtered = getFilteredData(trimmedQuery);

      toggleSuggestions(Boolean(trimmedQuery));

      statusEl.classList.toggle('is-searching', Boolean(trimmedQuery));

      statusEl.textContent = trimmedQuery
        ? 'Nalezeno: ' + filtered.length + ' z ' + veritele.length
        : 'Načteno: ' + filtered.length + ' věřitelů';

      emptyEl.style.display = filtered.length ? 'none' : 'block';

      results.innerHTML = filtered.map(function(v, index) {
        var name = String(v.nazev || '').trim();
        var safeName = escapeHtml(name);
        var hasAlias = Boolean(cleanAlias(v.aliasy));
        var cardClass = hasAlias ? 'creditor-card has-alias' : 'creditor-card no-alias';

        return '' +
          '<article class="' + cardClass + '">' +
            '<div class="creditor-core">' +
              '<div class="creditor-title-wrap">' +
                '<button class="copy-name" type="button" data-copy-text="' + safeName + '" aria-label="Kopírovat název věřitele ' + safeName + '">' +
                  '<span>' + highlight(name, query) + '</span>' +
                  '<span class="copy-icon" aria-hidden="true">⧉</span>' +
                '</button>' +
              '</div>' +

              '<button class="detail-toggle" type="button" aria-expanded="false" aria-controls="creditor-detail-' + index + '" data-toggle-detail>' +
                '<span class="toggle-text">Zobrazit IČO a adresu</span>' +
                '<span class="toggle-symbol" aria-hidden="true">+</span>' +
              '</button>' +
            '</div>' +

            buildDetails(v, query, index) +
            buildAliasBox(v.aliasy, query) +
          '</article>';
      }).join('');
    }

    function showToast(text) {
      if (!copyToast) return;

      copyToast.textContent = text || 'Zkopírováno';
      copyToast.classList.add('is-visible');

      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(function() {
        copyToast.classList.remove('is-visible');
      }, 1400);
    }

    function copyText(text) {
      var value = String(text || '').trim();

      if (!value) {
        return;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(function() {
          showToast('Zkopírováno: ' + value);
        }).catch(function() {
          fallbackCopyText(value);
          showToast('Zkopírováno: ' + value);
        });
        return;
      }

      fallbackCopyText(value);
      showToast('Zkopírováno: ' + value);
    }

    function fallbackCopyText(text) {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();

      try {
        document.execCommand('copy');
      } catch (error) {}

      document.body.removeChild(textarea);
    }

    input.addEventListener('input', function() {
      renderResults(input.value);
    });

    results.addEventListener('click', function(event) {
      var copyTarget = event.target.closest('[data-copy-text]');

      if (copyTarget) {
        copyText(copyTarget.getAttribute('data-copy-text') || '');
        return;
      }

      var toggleButton = event.target.closest('[data-toggle-detail]');

      if (toggleButton) {
        var card = toggleButton.closest('.creditor-card');
        var isOpen = card && card.classList.toggle('is-open');
        var text = toggleButton.querySelector('.toggle-text');

        toggleButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        if (text) text.textContent = isOpen ? 'Skrýt IČO a adresu' : 'Zobrazit IČO a adresu';
      }
    });

    renderChips();

    fetch('data/veritele.json')
      .then(function(response) {
        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }
        return response.json();
      })
      .then(function(data) {
        veritele = Array.isArray(data) ? data : [];
        renderResults('');
      })
      .catch(function(error) {
        statusEl.textContent = 'Nepodařilo se načíst data ze souboru data/veritele.json.';
        console.error(error);
      });
