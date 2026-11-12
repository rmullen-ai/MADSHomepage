const cycleMenu = document.querySelector(".cycle-menu");
const cycleToggle = cycleMenu.querySelector("summary");
const cycleOptions = cycleMenu.querySelector(".cycle-options");
let cyclePinned = false;

function closeCycleMenu() {
  cyclePinned = false;
  cycleMenu.open = false;
}

cycleMenu.addEventListener("pointerenter", event => {
  if (event.pointerType === "mouse") cycleMenu.open = true;
});

cycleMenu.addEventListener("pointerleave", event => {
  if (event.pointerType === "mouse" && !cyclePinned && !cycleOptions.contains(document.activeElement)) {
    closeCycleMenu();
  }
});

cycleToggle.addEventListener("click", event => {
  event.preventDefault();
  cyclePinned = !cyclePinned;
  cycleMenu.open = cyclePinned;
});

cycleMenu.addEventListener("focusout", event => {
  if (!cycleMenu.contains(event.relatedTarget)) closeCycleMenu();
});

cycleMenu.addEventListener("keydown", event => {
  if (event.key === "Escape" && cycleMenu.open) {
    event.preventDefault();
    closeCycleMenu();
    cycleToggle.focus();
  }
});

document.addEventListener("pointerdown", event => {
  if (!cycleMenu.contains(event.target)) closeCycleMenu();
});
