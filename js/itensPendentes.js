var countAllItems = 0;
var countItensSelected = 0;
var allCheckboxsSelected = false;
$(document).on("pageinit", "#pagItens", function () {
    closeModal();
    $(".list-buttons").hide();
    $(".ui-input-search").hide();
    allCheckboxsSelected = false;

    if (isIphone()) {
        $(".buttons-main").css("margin-top", "10px");
        $(".iphone-tollbar").show();


        $(document).on('focus', '.ui-input-search', function (e) {
            $(".btn-group").css({ "position": "static", "bottom": 0 }).trigger("refresh");
            $(".ui-btn").last().addClass("padding-button");
        });
        $(document).on('blur', '.ui-input-search', function (e) {
            setTimeout(function () {
                $(".btn-group").css({ "position": "fixed", "bottom": 0 }).trigger("refresh");
                $(".ui-btn").last().removeClass("padding-button");
            }, 200);
        });
    }
    sessionStorage.setItem('id', '');
    sessionStorage.setItem('status', '');

    document.getElementById('tipoItem').innerHTML = sessionStorage.getItem('descricao');

    listarItens();
});

$(document).on('click', '#list tr input[type="checkbox"]', function () {
    if (!($(this).parents('tr').find('.line-table img').hasClass('error-warning'))) {
        if (!$(this).parents('tr').hasClass('line-selected')) {
            $(this).parents('tr').find('input[type="checkbox"]').prop('checked', true).checkboxradio("refresh");
            $(this).parents('tr').addClass('line-selected');
        }
        else {
            $(this).parents('tr').find('input[type="checkbox"]').prop('checked', false).checkboxradio("refresh");
            $(this).parents('tr').removeClass('line-selected');
        }
    }
    updateItensSelected();
});

function updateItensSelected() {
    countItensSelected = buscarSelecionados().length;

    if ((countAllItems - $(".box-list").find('.error-warning').length) == countItensSelected) {
        $(".select-all").html("Desmarcar todos");
        allCheckboxsSelected = true;
    }
    else {
        $(".select-all").html("Marcar todos");
        allCheckboxsSelected = false;
    }

    if (countItensSelected > 0) {

        $(".list-buttons").slideDown();
        $(".container").attr('style', 'margin-top: 30px;');

        if (countItensSelected == 1)
            $(".itens-number-selecteds").html(countItensSelected + ' item selecionado');
        else
            $(".itens-number-selecteds").html(countItensSelected + ' itens selecionados');

    }
    else {
        $(".list-buttons").slideUp();
        $(".container").attr('style', 'padding-top: 2% !important');
    }
}

function checkAll() {
    if (!allCheckboxsSelected) {
        $('#list tr').each(function () {
            if (!($(this).find('.line-table img').hasClass('error-warning'))) {
                $(this).find('input[type="checkbox"]').prop('checked', true).checkboxradio("refresh");
                $(this).addClass('line-selected');
                $(this).find(".fakecheck").attr("src", "../img/checked.png");
            }
        });
        allCheckboxsSelected = true;
    }
    else {
        allCheckboxsSelected = false;
        $('#list tr').each(function () {
            $(this).find('input[type="checkbox"]').prop('checked', false).checkboxradio("refresh");
            $(this).removeClass('line-selected');
            $(this).find(".fakecheck").attr("src", "../img/unchecked.png");
        });

    }
    updateItensSelected();
}

function aprovarItens() {
    var itensAprovados = buscarSelecionados('03', '');
    salvarItens(itensAprovados, onSuccessSalvar, onErrorSalvar);
}

function reprovarItens() {
    var itensReprovados = buscarSelecionados('04', '');
    salvarItens(itensReprovados, onSuccessSalvar, onErrorSalvar);
}

function confirmaAprovacao(el) {
    var msg = '';
    countItensSelected = buscarSelecionados().length;

    if (countItensSelected == 1)
        msg = 'do item selecionado?';
    else
        msg = 'de ' + countItensSelected + ' itens selecionados?';

    bloquearScroll();

    $(el).simpledialog2({
        mode: 'button',
        headerText: 'Confirmação',
        headerClose: false,
        buttonPrompt: 'Confirma a aprovação ' + msg,
        buttons: {
            'OK': {
                click: function () {
                    aprovarItens();
                    desbloquearScroll();
                }
            },
            'Cancel': {
                click: function () {
                    desbloquearScroll();
                },
                icon: "delete",
                theme: "b"
            }
        }
    });
}

function confirmaReprovacao(el) {
    var msg;
    countItensSelected = buscarSelecionados().length;

    if (countItensSelected == 1)
        msg = 'do item selecionado?';
    else
        msg = 'de ' + countItensSelected + ' itens selecionados?';

    bloquearScroll();

    $(el).simpledialog2({
        mode: 'button',
        headerText: 'Confirmação',
        headerClose: false,
        buttonPrompt: 'Confirma a reprovação ' + msg,
        buttons: {
            'OK': {
                click: function () {
                    reprovarItens();
                    desbloquearScroll();
                }
            },
            'Cancel': {
                click: function () {
                    desbloquearScroll();
                },
                icon: "delete",
                theme: "b"
            }
        }
    });
}

function onSuccessSalvar(operacao) {
    $('#list tbody').html('');
    listarItens();
    $(".list-buttons").hide();
    $('.select-all').hide();
    $("#lstItens").val('');
}

function onErrorSalvar(jqXHR, textStatus, errorThrown) {
    msgServicoIndisponivel(jqXHR, $(".btn-primary").last());
}

function buscarSelecionados(codTipo, obs) {
    var itens = [];
    $(".box-list input[type='checkbox']:checked").each(function () {
        itens.push({
            "id": $(this).attr('id'),
            "statusAprovacao": codTipo,
            "observacao": obs
        });
    });
    return itens;
}

function listarItens() {
    $("body").scrollTop(0);
    showLoading();
    bloquearScroll();
    $.ajax({
        type: "GET",
        dataType: "json",
        url: itemUrl + sessionStorage.getItem('tipo') + '/' + sessionStorage.getItem('usuario').toUpperCase(),
        headers: {
            "token": sessionStorage.token
        },
        success: onSuccessListar,
        error: onErrorListar
    })
    .done(function () {
        hideLoading();
    })
    .always(function () {
        desbloquearScroll();
    });
}

function onSuccessListar(data) {
    var li = '';
    countAllItems = data.length;
    var lstItens = sessionStorage.itens ? $.parseJSON(sessionStorage.itens) : [];
    var hasValidItems = false;

    if (countAllItems != 0) {
        $.each(data, function (index, value) {
            var result = $.grep(lstItens, function (e) { return e.id == value.id; });
            if (result.length > 0) {
                li += '<tr class="striped line-selected"> <td><span class="line-table">';
            }
            else {
                if (index % 2 == 0) {
                    li += '<tr> <td><span class="line-table">';
                } else {
                    li += '<tr class="striped"> <td><span class="line-table">';
                }
            }
            if (value.status == 'E') {
                li += '<img src="../css/images/icons-png/error.png"  class="error-warning" alt="">';
            } else {
                if (result.length > 0) {
                    li += '<input type="checkbox" checked="checked" name="' + value.id + '" id="' + value.id + '"/>';
                    li += '<img src="../img/checked.png" class="fakecheck" onclick="checkthis(this)">';
                }
                else {
                    li += '<input type="checkbox"  name="' + value.id + '" id="' + value.id + '"/>';
                    li += '<img src="../img/unchecked.png" class="fakecheck" onclick="checkthis(this)">';
                }
                hasValidItems = true;
            }
            li += '<p data-transition="slide" href="#" onclick="redirecionaDetalhamento(\'' + value.id + '\', \'' + value.status + '\', \'' + sessionStorage.getItem('descricao') + '\')">'
					+ value.descricao + '</p></span></td></tr>';
        });

        $('#list tbody').append(li);
        $('#list tbody').trigger('create');
        if (hasValidItems) {
            $('.select-all').show();
        }
        $(".ui-input-search").show();
        sessionStorage.setItem('itens', '');
        updateItensSelected();
    } else {
        $('.msg-empty').show();
    }
}

function redirecionaDetalhamento(idItem, statusItem, descricaoItem) {
    var lstItens = [];
    lstItens = buscarSelecionados();
    sessionStorage.setItem('id', idItem);
    sessionStorage.setItem('status', statusItem);
    sessionStorage.setItem('descricao', descricaoItem);
    sessionStorage.setItem('itens', JSON.stringify(lstItens));

    $.mobile.changePage("itemDetalhamento.html", {
        transition: "slide"
    });
}

function onErrorListar(jqXHR, textStatus, errorThrown) {
    msgServicoIndisponivel(jqXHR, $(".btn-primary").last());
}
