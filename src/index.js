// @ts-check

// Randomize hue
document.documentElement.style.setProperty("--hue", `${Math.random() * 360}`);

// Update rotation on slider input
document.querySelector('#rotation-range').addEventListener('input', e => {
  // @ts-ignore: must cast e.target to HTMLInputElement
  const rotation = `${parseFloat(e.target.value)}deg`
  document.documentElement.style.setProperty('--rotation', rotation)
})
