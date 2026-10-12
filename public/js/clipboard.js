function copyLink(id) {
  const input = document.querySelector(`#${CSS.escape(id)}`);
  navigator.clipboard.writeText(input.value).then(() => {
    alert("Link copied to clipboard");
  });
}
