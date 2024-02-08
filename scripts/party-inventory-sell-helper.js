Hooks.on('renderPartySheetPF2e', (partySheet, dom, partyData) => {
    dom.find('.tab.inventory ul.items > li').each((_, itemElement) => {
        const $currItemElement = $(itemElement);
        const partyInventory = partySheet.object.inventory;
        const item = partyInventory.get($currItemElement.data('itemId'));
        const isSellable = item.isIdentified || game.user.isGM;

        if (isSellable && !item.isOfType('treasure')) {
            const sellButton = $('<a class="item-sell-treasure" data-tooltip="PF2E.ui.sell"><i class="fa-solid fa-coins fa-fw"></i></a>');
            sellButton.click(async () => {
                const content = `
                    <p>
                        ${game.i18n.format('PartyInventorySellHelper.SellItemQuestion',
                            {
                                item: item.name,
                                field: '<input class="party-inventory-sell-helper percent-field" type="number" value="50" min="0" max="999" step="1">'
                            })}
                    </p>`;
                return new Dialog({
                    title: game.i18n.localize('PF2E.SellItemConfirmHeader'),
                    content: content,
                    buttons: {
                        Yes: {
                            icon: `<i class="fas fa-check"></i>`,
                            label: game.i18n.localize("Yes"),
                            callback: async (form) => {
                                const requestedScaler = form.find('.percent-field').val() / 100;
                                if (Number.isFinite(requestedScaler) && requestedScaler > 0) {
                                    await item.delete();
                                    const price = item.assetValue.scale(requestedScaler);
                                    await partyInventory.addCoins(price);
                                }
                                else {
                                    ui.notifications.error("PartyInventorySellHelper.InvalidPercentageError", { localize: true });
                                }
                            },
                        },
                        cancel: {
                            icon: `<i class="fas fa-times"></i>`,
                            label: game.i18n.localize('Cancel'),
                        },
                    },
                    default: 'Yes',
                }).render(true);
            });
            $currItemElement.find('.item-controls > a:first').after(sellButton);
        }
    })
});
