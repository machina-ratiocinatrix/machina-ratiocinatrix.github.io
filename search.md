---
layout: page
title: Search
permalink: /search/
---

# Search

<div id="search-results"></div>

<script>
  // Inject Jekyll data into JavaScript
  const utilities = {{ site.data.utilities | jsonify }} || [];
  const baseUrl = "{{ site.baseurl }}";

  document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    const resultsContainer = document.getElementById('search-results');

    if (query) {
      const lowerCaseQuery = query.toLowerCase().trim();
      
      // Filter utilities based on the query verb
      const matchingUtilities = utilities.filter(item => {
        return item.verbs && item.verbs.some(verb => verb.toLowerCase() === lowerCaseQuery);
      });

      displayResults(query, matchingUtilities);
    } else {
      resultsContainer.innerHTML = '<p>No search query provided.</p>';
    }

    function displayResults(searchQuery, results) {
      if (results.length === 0) {
        resultsContainer.innerHTML = '<p>No results found for: <strong>' + escapeHtml(searchQuery) + '</strong></p>';
        return;
      }

      let html = '<h2>Results for: ' + escapeHtml(searchQuery) + '</h2><ul style="list-style-type: none; padding: 0;">';
      
      results.forEach(function(item) {
        const label = item.description ? item.description : item.url;
        const iconPath = baseUrl + '/assets/icons/' + item.icon;
        
        // Icon wrapped in a link
        const iconHtml = item.icon ? 
            '<a href="' + item.url + '" style="margin-right: 10px; text-decoration: none;">' +
            '<img src="' + iconPath + '" alt="" style="width:48px;height:48px;vertical-align:middle;">' +
            '</a>' : '';
            
        // Verbs list (not clickable, black font)
        const verbsHtml = item.verbs ? '<div style="color: black; font-size: small;">Verbs: ' + item.verbs.join(', ') + '</div>' : '';
        
        html += '<li style="margin-bottom: 20px; display: flex; align-items: center;">' + 
                  iconHtml + 
                  '<div>' +
                    '<a href="' + item.url + '"><strong>' + label + '</strong></a>' +
                    verbsHtml +
                  '</div>' +
                '</li>';
      });
      
      html += '</ul>';
      resultsContainer.innerHTML = html;
    }

    // Basic HTML escaping to prevent XSS
    function escapeHtml(text) {
      if (!text) return text;
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
  });
</script>
