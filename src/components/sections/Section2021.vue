<template>
  <div style="display: flex; flex-direction: column; justify-content: center; height: 100%;">
    <h1 style="text-align: center; padding: 40px">
      Trillions in Aid: COVID-19's Economic Impact
    </h1>
    <p>
      The COVID-19 pandemic brought the global economy to a standstill. Lockdowns, quarantines, and disrupted supply chains  
      led to mass layoffs, business closures, and collapsing markets. To prevent economic freefall, governments  
      worldwide injected unprecedented amounts of money to stabilize businesses, protect jobs, and support households.
      Estimates indicate that total government aid measures worldwide exceeded <span class="data-highlight positive">14 Trillion USD</span> between the years 2020 and 2021.
    </p>
    <!-- Button, der die collapsible Funktion auslöst -->
    <button type="button" class="disclaimer-collapsible" @click="toggleCollapsible($event)">
      <div class="infoicon">i</div>Disclaimer
    </button>
    <!-- Collapsible Inhalt -->
    <div class="disclaimer-content">
      <p>
        Please note that exact figures for COVID-19 relief funds are difficult to determine.
        The values presented are based on estimates and approximations and are intended solely
        to illustrate the general scope of government aid measures.
      </p>
    </div> 
    <!--
    <div class="scroll-svg">
      <img src="../../assets/scroll-down.svg" alt="Scroll Icon">
    </div>
    -->
  </div>
</template>

<script>
export default {
  name: "Section2021",
  methods: {
    toggleCollapsible(event) {
    // Toggle die "active"-Klasse am Button
    event.currentTarget.classList.toggle("active");
    // Hole das nächste Geschwister-Element (den collapsible Inhalt)
    const content = event.currentTarget.nextElementSibling;
    content.classList.toggle("active-content");
    // Prüfe, ob der Inhalt bereits ausgeklappt ist
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";

    }
  }
  }
};
</script>

<style scoped>
p {
  text-align: center;
}

.infoicon {
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: #0001;
  font-size: 1em;
  margin-right: 10px;
  color: #0003;
  text-align: center;
  line-height: 2em;
}

/* Style den Button, der den collapsible Inhalt öffnet/schließt */
.disclaimer-collapsible {
  background-color: #f0eee6;
  color: #444;
  cursor: pointer;
  padding: 18px;
  width: 30%;
  margin: 0 auto;
  border: 1px solid #0003;
  border-radius: 20px;
  text-align: left;
  outline: none;
  font-size: 15px;
  display: flex;
  justify-content: center;
  transition: background-color 0.3s ease, width 0.3s ease;
  line-height: 60px;
  font-size: 2em;
}

/* Hintergrundfarbe ändern, wenn der Button aktiv oder gehovt wird */
.active, .disclaimer-collapsible:hover {
  background-color: #f0eee6;
  width: 100%;
}

.active {
  border-bottom-right-radius: 0px;
  border-bottom-left-radius: 0px;
}

.active-content {
  border: 1px solid #0003;
}

/* Style den collapsible Inhalt – standardmäßig versteckt */
.disclaimer-content {
  padding: 0 18px;
  background-color: white;
  max-height: 0;
  overflow: hidden;
  border-bottom-right-radius: 20px;
  border-bottom-left-radius: 20px;
  transition: max-height 0.2s ease-out;
}

.data-highlight {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: bold;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
  margin: 0 5px 0 2px;
}

.data-highlight:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.positive {
  color: #28a745;
  background-color: #e8f5e9;
}

.negative {
  color: #dc3545;
  background-color: #ffebee;
}

.warning {
  color: #ffc107;
  background-color: #fff3e0;
}
</style>