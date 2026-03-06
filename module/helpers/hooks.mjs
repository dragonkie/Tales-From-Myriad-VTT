export default function registerHooks() {
    Hooks.once("renderSettings", async (settings, html, context, options) => {
        //==========================================================================================================
        //> Tales from Myriad official links
        //==========================================================================================================
        try {
            const section = document.createElement('section');
            section.classList.add('flexcol');

            // create the divider header
            const divider = document.createElement('h4');
            divider.classList.add('divider');
            divider.textContent = 'Tales From Myriad';

            // create the buttons
            const shop = document.createElement('a');
            shop.classList.add('button');
            shop.href = 'https://metalweavegames.com/';
            shop.innerHTML = `<i class="fas fa-shop"></i> Metal Weave Games`;

            const book = document.createElement('a');
            book.classList.add('button');
            book.href = 'https://metalweavegames.com/collections/tales-from-myriad';
            book.innerHTML = `<i class="fas fa-book"></i> Get the book!`;

            // Myriad official discord server
            const discord = document.createElement('a');
            discord.href = 'https://discord.gg/nuq5AYgP';
            discord.classList.add('button');
            discord.innerHTML = `<i class="fa-brands fa-discord"></i> Discord`;

            // add everything together
            section.appendChild(divider);
            section.appendChild(shop);
            section.appendChild(book);
            section.appendChild(discord);

            // append it to the settings tab
            html.appendChild(section);
        } catch (err) {
            console.error('Failed to append TFM browser links to settings tab');
        }

        //==========================================================================================================
        //> Developer links
        //==========================================================================================================
        try {
            const section = document.createElement('section');
            section.classList.add('flexcol');

            // create the divider header
            const divider = document.createElement('h4');
            divider.classList.add('divider');
            divider.textContent = 'System Developer';

            // System github
            const git = document.createElement('a');
            git.href = 'https://github.com/dragonkie/Tales-From-Myriad-FVTT';
            git.classList.add('button');
            git.innerHTML = `<i class="fa-brands fa-github"></i> Github`;

            // Developers patreon
            const patreon = document.createElement('a');
            patreon.href = 'https://www.patreon.com/cw/AstasArmoury';
            patreon.classList.add('button');
            patreon.innerHTML = `<i class="fa-brands fa-patreon"></i> Support us on Patreon`;

            // Ko-fi link
            const kofi = document.createElement('a');
            kofi.href = 'https://ko-fi.com/dragonkie';
            kofi.classList.add('button');
            kofi.innerHTML = `<i class="fas fa-coffee"></i> Buy the devs a coffee`;

            // add everything together
            section.appendChild(divider);
            section.appendChild(git);
            section.appendChild(kofi);
            section.appendChild(patreon);

            // append it to the settings tab
            html.appendChild(section);
        } catch (err) {
            console.error('Failed to append developer support links');
        }
    });
}