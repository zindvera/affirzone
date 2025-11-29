document.addEventListener('DOMContentLoaded', () => {
  // Get current path from window.location.pathname, ignoring the filename
  const pathParts = window.location.pathname.split('/').filter(part => part.length > 0);
  
  // Assuming your root has index.html, and desktop shows /folder1/folder2/page.html etc.
  // Subtract 1 from length to exclude the filename itself if it's not a directory
  const levelsDeep = pathParts.length > 0 && pathParts[pathParts.length - 1].includes('.') ? pathParts.length - 1 : pathParts.length;
  
  // Construct relative prefix of ../ per folder level
  let relativePrefix = '';
  for (let i = 0; i < levelsDeep; i++) {
    relativePrefix += '../';
  }
  
  const navDiv = document.querySelector('.navdiv');
  if (navDiv) {
    const scrollNavHTML = `
  
        <div class="scroll-nav" style="width: 100vw; position: fixed; top: 0; left: 0; background: white; z-index: 1000; padding: 0.5rem 1rem; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <div class="d-flex align-items-center">
          <a href="${relativePrefix}index.html" style="text-decoration: none;">
            <img id="brandLogo" src="${relativePrefix}media/Affirzone-logo.png" alt="Affirzone Scroll Logo">
          </a>
          <div class="fsearch-container flex-grow-1">
             <a href="${relativePrefix}" id="home-link" style="text-decoration: none;
            font-size: 16px; margin-left: 13px; cursor: pointer;">home</a>
                <a href="${relativePrefix}shop/" id="store-link" style="text-decoration: none;
            font-size: 16px; margin-left: 13px; cursor: pointer;">store</a>
          </div>
        </div>
      </div>

    `;
    navDiv.insertAdjacentHTML('beforeend', scrollNavHTML);
  }
});
