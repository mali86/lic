angular.module('lic.templates', []).run(['$templateCache', function ($templateCache) {
  "use strict";
  $templateCache.put("/app/sections/areas/addEditAreas/areaAddEdit.html",
    "<!-- md-dialog aria-label=\"Modal\" flex> -->\n" +
    "<div flex layout=\"column\" >\n" +
    "    <span class=\"table-title\">Area {{area.id ? 'Edit - ' + area.name : 'Add'}}</span>\n" +
    "    <form name=\"form\">\n" +
    "        <!-- <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2>Area {{area.id ? 'Edit - ' + area.name : 'Add'}}</h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar> -->\n" +
    "        <md-content>\n" +
    "            <div flex layout=\"column\" layout-padding>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Name</label>\n" +
    "                        <input ng-model=\"area.name\" name=\"name\" required type=\"text\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.name.$error.required\">Please enter area name</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div flex>\n" +
    "                    <md-autocomplete md-input-name=\"state\" md-selected-item=\"selectedState\" md-search-text=\"searchStateText\" md-selected-item-change=\"selectState(state)\"\n" +
    "                        md-items=\"state in loadStates(searchStateText)\" md-item-text=\"state.name\" md-require-match required md-delay=\"300\"\n" +
    "                        md-min-length=\"0\" md-floating-label=\"State\">\n" +
    "                        <md-item-template>\n" +
    "                            <span md-highlight-text=\"searchStateText\">{{state.name}}</span>\n" +
    "                        </md-item-template>\n" +
    "                        <md-not-found>\n" +
    "                            No matching \"{{searchStateText}}\" states were found.\n" +
    "                        </md-not-found>\n" +
    "                        <em class=\"error-message\" ng-show=\"form.state.$error.required\">Please select state</em>\n" +
    "                    </md-autocomplete>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </md-content>\n" +
    "        <section layout=\"row\">\n" +
    "            <!-- <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button> -->\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading\">\n" +
    "                <span ng-show=\"loading\">Please wait...</span>\n" +
    "                <span ng-show=\"!loading && area.id\"><span class=\"icon-lic-update btn-icon\"></span> Update</span>\n" +
    "                <span ng-show=\"!loading && !area.id\"><span class=\"icon-lic-save btn-icon\"></span> Add</span>\n" +
    "            </md-button>\n" +
    "        </section>\n" +
    "    </form>\n" +
    "<!-- </md-dialog> -->");
  $templateCache.put("/app/sections/areas/area.html",
    "<div>\n" +
    "    <div layout=\"column\">\n" +
    "        <span class=\"table-title padding-bottom\">\n" +
    "            <!-- <i class=\"fa fa-database\" aria-hidden=\"true\"></i> -->\n" +
    "             Areas</span>\n" +
    "        <form novalidate flex layout=\"row\" ng-submit=\"search()\">\n" +
    "            <md-input-container flex>\n" +
    "                <label>Search</label>\n" +
    "                <input type=\"text\" autocomplete=\"off\" ng-disabled=\"!total && !params.search\" ng-model=\"params.search\" ng-change=\"search()\">\n" +
    "            </md-input-container>\n" +
    "           <!--  <md-button class=\"md-fab md-mini\" type=\"submit\" ng-disabled=\"!total && !params.search\" aria-label=\"Search\">\n" +
    "                <i class=\"fa fa-search\"></i>\n" +
    "            </md-button> -->\n" +
    "            <md-input-container class=\"no\">\n" +
    "                <md-button class=\"md-raised md-primary\" type=\"button\" ng-click=\"openAreaAdd()\" aria-label=\"Add\">\n" +
    "                    <span class=\"icon-lic-add btn-icon\"></span>Add New Area\n" +
    "                </md-button>\n" +
    "            </md-input-container>\n" +
    "        </form>\n" +
    "        <h4 ng-show=\"loading\" class=\"text-center\">Please wait...</h4>\n" +
    "        <md-table-container ng-if=\"total > 0 && !loading\">\n" +
    "            <table md-table md-progress=\"promise\">\n" +
    "                <thead md-head md-order=\"params.sort_by\" md-on-reorder=\"sortAreas\">\n" +
    "                    <tr md-row>\n" +
    "												<th md-column md-order-by=\"name\">\n" +
    "														<span>Name</span>\n" +
    "														<i class=\"fa fa-sort\" aria-hidden=\"true\">\n" +
    "																<md-tooltip md-direction=\"bottom\">Sort by Area name</md-tooltip>\n" +
    "														</i>\n" +
    "												</th>\n" +
    "                    </tr>\n" +
    "                </thead>\n" +
    "                <tbody md-body>\n" +
    "                    <tr md-row ng-repeat=\"area in areas track by $index\">\n" +
    "                        <td md-cell ng-bind=\"area.name\"></td>\n" +
    "                        <td md-cell text-right>\n" +
    "                            <md-button class=\"md-accent md-hue-1 md-icon-button td-btn-edit\" ng-click=\"openAreaEdit(area)\">\n" +
    "                                <span class=\"icon-lic-edit\" aria-hidden=\"true\"></span>\n" +
    "                                <md-tooltip md-direction=\"bottom\">Edit</md-tooltip>\n" +
    "                            </md-button>\n" +
    "                            <md-button class=\"md-icon-button md-warn td-btn-delete\" ng-disabled=\"area.loading\" ng-click=\"removeModal($event, area)\">\n" +
    "                                <span class=\"icon-lic-delete\" aria-hidden=\"true\"></span>\n" +
    "                                <md-tooltip md-direction=\"bottom\">Delete</md-tooltip>\n" +
    "                            </md-button>\n" +
    "                        </td>\n" +
    "                    </tr>\n" +
    "                </tbody>\n" +
    "            </table>\n" +
    "        </md-table-container>\n" +
    "        <h4 ng-show=\"!loading && !total && !params.search\" class=\"text-center\">Currently there are no areas in your database.</h4>\n" +
    "        <md-table-pagination ng-if=\"total > 0 && !loading\"\n" +
    "                             md-options=\"[10, 20, 30]\"\n" +
    "                             md-limit=\"params.limit\"\n" +
    "                             md-page=\"params.page\"\n" +
    "                             md-total=\"{{total}}\"\n" +
    "                             md-on-paginate=\"onPaginate\"\n" +
    "                             md-page-select></md-table-pagination>\n" +
    "    </div>\n" +
    "</div>");
  $templateCache.put("/app/sections/areas/modals/areaModal.html",
    "<md-dialog aria-label=\"Modal\" flex>\n" +
    "    <form name=\"form\">\n" +
    "        <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2>Area {{area.id ? 'Edit - ' + area.name : 'Add'}}</h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar>\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"md-dialog-content\">\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Name</label>\n" +
    "                        <input ng-model=\"area.name\" name=\"name\" required type=\"text\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.name.$error.required\">Please enter area name</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div flex>\n" +
    "                    <md-autocomplete md-input-name=\"state\" md-selected-item=\"selectedState\" md-search-text=\"searchStateText\" md-selected-item-change=\"selectState(state)\"\n" +
    "                        md-items=\"state in loadStates(searchStateText)\" md-item-text=\"state.name\" md-require-match required md-delay=\"300\"\n" +
    "                        md-min-length=\"0\" md-floating-label=\"State\">\n" +
    "                        <md-item-template>\n" +
    "                            <span md-highlight-text=\"searchStateText\">{{state.name}}</span>\n" +
    "                        </md-item-template>\n" +
    "                        <md-not-found>\n" +
    "                            No matching \"{{searchStateText}}\" states were found.\n" +
    "                        </md-not-found>\n" +
    "                        <em class=\"error-message\" ng-show=\"form.state.$error.required\">Please select state</em>\n" +
    "                    </md-autocomplete>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "        <md-dialog-actions layout=\"row\">\n" +
    "            <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button>\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading\">\n" +
    "                <span ng-show=\"loading\">Please wait...</span>\n" +
    "                <span ng-show=\"!loading && area.id\">Update</span>\n" +
    "                <span ng-show=\"!loading && !area.id\">Add</span>\n" +
    "            </md-button>\n" +
    "        </md-dialog-actions>\n" +
    "    </form>\n" +
    "</md-dialog>");
  $templateCache.put("/app/sections/categories/categories.html",
    "<div>\n" +
    "    <div layout=\"column\">\n" +
    "        <span class=\"table-title padding-bottom\">\n" +
    "            <!-- <i class=\"fa fa-database\" aria-hidden=\"true\"></i>  -->\n" +
    "        Categories</span>\n" +
    "        <form novalidate flex layout=\"row\" ng-submit=\"search()\">\n" +
    "            <md-input-container flex>\n" +
    "                <label>Search</label>\n" +
    "                <input type=\"text\" autocomplete=\"off\" ng-disabled=\"!total && !params.search\" ng-model=\"params.search\"\n" +
    "                       ng-change=\"search()\">\n" +
    "            </md-input-container>\n" +
    "            <!-- <md-button class=\"md-fab md-mini\" type=\"submit\" ng-disabled=\"!total && !params.search\" aria-label=\"Search\">\n" +
    "                <i class=\"fa fa-search\"></i>\n" +
    "            </md-button> -->\n" +
    "            <md-input-container class=\"no\">\n" +
    "                <md-button class=\"md-raised md-primary\" type=\"button\" ng-click=\"openCategoryAdd()\" aria-label=\"Add\">\n" +
    "                    <span class=\"icon-lic-add btn-icon\"></span>Add New Category\n" +
    "                </md-button>\n" +
    "            </md-input-container>\n" +
    "        </form>\n" +
    "        <h4 ng-show=\"loading\" class=\"text-center\">Please wait...</h4>\n" +
    "        <md-table-container ng-if=\"total > 0 && !loading\">\n" +
    "            <table md-table md-progress=\"promise\">\n" +
    "                <thead md-head md-order=\"params.sort_by\" md-on-reorder=\"sortCategories\">\n" +
    "                <tr md-row>\n" +
    "                    <th md-column md-order-by=\"name\">\n" +
    "                        <span>Name</span>\n" +
    "                        <i class=\"fa fa-sort\" aria-hidden=\"true\">\n" +
    "                            <md-tooltip md-direction=\"bottom\">Sort by Category name</md-tooltip>\n" +
    "                        </i>\n" +
    "                    </th>\n" +
    "                    <th md-column >\n" +
    "                        <span>Image</span>\n" +
    "                    </th>\n" +
    "                    <th md-column >\n" +
    "                        <span>Color</span>\n" +
    "                    </th>\n" +
    "                </tr>\n" +
    "                </thead>\n" +
    "                <tbody md-body>\n" +
    "                <tr md-row ng-repeat=\"category in categories track by $index\">\n" +
    "                    <td md-cell ng-bind=\"category.name\"></td>\n" +
    "                    <td md-cell>\n" +
    "                        <div class=\"category-image\">\n" +
    "                            <img ng-if=\"category.logo\" width=\"125\" height=\"125\" ng-src=\"{{category.logo}}\">\n" +
    "                            <img ng-if=\"!category.logo\" width=\"125\" height=\"125\" src=\"../../../assets/images/no-image.png\">\n" +
    "                        </div>\n" +
    "                    </td>\n" +
    "                    <td md-cell>\n" +
    "                        <div class=\"category-color\">\n" +
    "                            <!-- <img ng-if=\"category.logo\" width=\"125\" height=\"125\" ng-src=\"{{category.logo}}\">\n" +
    "                            <img ng-if=\"!category.logo\" width=\"125\" height=\"125\" src=\"../../../assets/images/no-image.png\"> -->\n" +
    "                            <span class=\"color-present\" style=\"background-color: {{convertHex(category.color)}}; color: #ffffff;\" >{{category.color}}</span>\n" +
    "                        </div>\n" +
    "                    </td>\n" +
    "                    <td md-cell text-right>\n" +
    "                        <md-button class=\"md-accent md-hue-1 md-icon-button td-btn-edit\" ng-click=\"openCategoryEdit(category)\">\n" +
    "                            <span class=\"icon-lic-edit\" aria-hidden=\"true\"></span>\n" +
    "                            <md-tooltip md-direction=\"bottom\">Edit</md-tooltip>\n" +
    "                        </md-button>\n" +
    "                        <md-button class=\"md-icon-button md-warn td-btn-delete\" ng-disabled=\"category.loading\"\n" +
    "                                   ng-click=\"removeModal($event, category)\">\n" +
    "                            <span class=\"icon-lic-delete\" aria-hidden=\"true\"></span>\n" +
    "                            <md-tooltip md-direction=\"bottom\">Delete</md-tooltip>\n" +
    "                        </md-button>\n" +
    "                    </td>\n" +
    "                </tr>\n" +
    "                </tbody>\n" +
    "            </table>\n" +
    "        </md-table-container>\n" +
    "        <h4 ng-show=\"!loading && !total && !params.search\" class=\"text-center\">Currently there are no categories in your\n" +
    "            database.</h4>\n" +
    "        <md-table-pagination ng-if=\"total > 0 && !loading\"\n" +
    "                             md-options=\"[10, 20, 30]\"\n" +
    "                             md-limit=\"params.limit\"\n" +
    "                             md-page=\"params.page\"\n" +
    "                             md-total=\"{{total}}\"\n" +
    "                             md-on-paginate=\"onPaginate\"\n" +
    "                             md-page-select></md-table-pagination>\n" +
    "    </div>\n" +
    "</div>");
  $templateCache.put("/app/sections/categories/categoriesAddEdit/categoryAddEdit.html",
    "<!-- <md-dialog aria-label=\"Modal\" flex> -->\n" +
    "<div flex layout=\"column\" >\n" +
    "    <span class=\"table-title\">\n" +
    "        Category {{category.id ? 'Edit - ' + category.name : 'Add'}}\n" +
    "    </span>\n" +
    "    <form name=\"form\">\n" +
    "        <!-- md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2>Category {{category.id ? 'Edit - ' + category.name : 'Add'}}</h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar> -->\n" +
    "        <md-content>\n" +
    "            <div flex layout=\"column\" layout-padding>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Name</label>\n" +
    "                        <input ng-model=\"category.name\" name=\"name\" required type=\"text\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.name.$error.required\">Please enter category name</em>\n" +
    "                    </md-input-container>\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Color #123456</label>\n" +
    "                        <input ng-model=\"category.color\" name=\"color\" required type=\"text\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.name.$error.required\">Please enter category color in hexadecial, example: #FFFFFF</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"column\">\n" +
    "                    <h4>Category Image</h4>\n" +
    "                    <div ng-if=\"imagePreparedForUpload\" file=\"imagePreparedForUpload._file\" width=\"140\" height=\"140\" ng-thumb></div>\n" +
    "                    <div class=\"merchant-logo-container\" ng-if=\"category.logo && !imagePreparedForUpload\">\n" +
    "                        <a href=\"#\" ng-click=\"removeLogo()\"><i class=\"fa fa-minus-circle\" aria-hidden=\"true\"></i></a>\n" +
    "                        <img width=\"140\" height=\"140\" ng-src=\"{{category.logo}}\">\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <input type=\"file\" nv-file-select=\"\" uploader=\"uploader\" />\n" +
    "            </div>\n" +
    "        </md-content>\n" +
    "        <section layout=\"row\">\n" +
    "            <!-- <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button> -->\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading\">\n" +
    "                <span ng-show=\"loading\">Please wait...</span>\n" +
    "                <span ng-show=\"!loading && category.id\"><span class=\"icon-lic-update btn-icon\"></span> Update Category </span>\n" +
    "                <span ng-show=\"!loading && !category.id\"><span class=\"icon-lic-save btn-icon\"></span> Add Category </span>\n" +
    "            </md-button>\n" +
    "        </section>\n" +
    "    </form>\n" +
    "</div>\n" +
    "<!-- </md-dialog> -->");
  $templateCache.put("/app/sections/categories/modals/categoryModal.html",
    "<md-dialog aria-label=\"Modal\" flex>\n" +
    "    <form name=\"form\">\n" +
    "        <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2>Category {{category.id ? 'Edit - ' + category.name : 'Add'}}</h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar>\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"md-dialog-content\">\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Name</label>\n" +
    "                        <input ng-model=\"category.name\" name=\"name\" required type=\"text\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.name.$error.required\">Please enter category name</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"column\">\n" +
    "                    <h4>Category Image</h4>\n" +
    "                    <div ng-if=\"imagePreparedForUpload\" file=\"imagePreparedForUpload._file\" width=\"140\" height=\"140\" ng-thumb></div>\n" +
    "                    <div class=\"merchant-logo-container\" ng-if=\"category.logo && !imagePreparedForUpload\">\n" +
    "                        <a href=\"#\" ng-click=\"removeLogo()\"><i class=\"fa fa-minus-circle\" aria-hidden=\"true\"></i></a>\n" +
    "                        <img width=\"140\" height=\"140\" ng-src=\"{{category.logo}}\">\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <input type=\"file\" nv-file-select=\"\" uploader=\"uploader\" />\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "        <md-dialog-actions layout=\"row\">\n" +
    "            <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button>\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading\">\n" +
    "                <span ng-show=\"loading\">Please wait...</span>\n" +
    "                <span ng-show=\"!loading && category.id\">Update Category </span>\n" +
    "                <span ng-show=\"!loading && !category.id\">Add Category </span>\n" +
    "            </md-button>\n" +
    "        </md-dialog-actions>\n" +
    "    </form>\n" +
    "</md-dialog>");
  $templateCache.put("/app/sections/change-password/change-password.html",
    "<md-content flex layout=\"row\" layout-align=\"center center\">\n" +
    "    <div flex-sm=\"80\" flex-gt-sm=\"60\" layout=\"column\" layout-padding>\n" +
    "        <md-whiteframe class=\"md-whiteframe-1dp\">\n" +
    "						<div flex layout=\"row\" layout-align=\"center center\" md-primary-color>\n" +
    "								<img class=\"outterpage-logo\" src=\"assets/images/logo-new.png\" />\n" +
    "						</div>\n" +
    "						<form name=\"form\" layout=\"column\" ng-if=\"!success\">\n" +
    "								<md-input-container flex>\n" +
    "										<label>New password</label>\n" +
    "										<input type=\"password\"\n" +
    "													 ng-model=\"data.password\"\n" +
    "													 ng-minlength=\"6\"\n" +
    "													 required>\n" +
    "										<em>* minimum 6 characters long</em>\n" +
    "								</md-input-container>\n" +
    "								<md-input-container flex class=\"password-container\">\n" +
    "										<label>Confirm password</label>\n" +
    "										<input type=\"password\" ng-model=\"data.password_confirmation\" required>\n" +
    "								</md-input-container>\n" +
    "								<md-button class=\"md-raised md-primary\" type=\"button\" ng-click=\"changePassword()\" pull-right ng-disabled=\"form.$invalid || loading || (data.password != data.password_confirmation)\">\n" +
    "										<span ng-show=\"!loading\">Change password</span>\n" +
    "										<span ng-show=\"loading\"><i class=\"fa fa-cog fa-spin\"></i> Please wait..</span>\n" +
    "								</md-button>\n" +
    "						</form>\n" +
    "            <div ng-if=\"!loading && success\" class=\"text-center\">\n" +
    "                <h3>You have successfully changed your password!</h3>\n" +
    "                <h3>Thank you!</h3>\n" +
    "                <md-button class=\"md-raised md-primary\" type=\"button\" ui-sref=\"login\">Login</md-button>\n" +
    "            </div>\n" +
    "        </md-whiteframe>\n" +
    "    </div>\n" +
    "</md-content>\n" +
    "");
  $templateCache.put("/app/sections/confirmEmail/confirmEmail.html",
    "<md-content flex layout=\"row\" layout-align=\"center center\">\n" +
    "    <div flex-sm=\"80\" flex-gt-sm=\"60\" layout=\"column\" layout-padding>\n" +
    "        <md-whiteframe class=\"md-whiteframe-1dp text-center\">\n" +
    "            <div flex layout=\"row\" layout-align=\"center center\" md-primary-color>\n" +
    "                <img class=\"outterpage-logo\" src=\"assets/images/logo-new.png\" />\n" +
    "            </div>\n" +
    "            <div ng-if=\"!loading && success\">\n" +
    "                <h3>You have successfully confirmed your email address!</h3>\n" +
    "                <h3>Thank you!</h3>\n" +
    "                <md-button class=\"md-raised md-primary\" type=\"button\" ui-sref=\"login\">Login</md-button>\n" +
    "            </div>\n" +
    "            <h3 ng-if=\"loading\">Please wait...</h3>\n" +
    "        </md-whiteframe>\n" +
    "    </div>\n" +
    "</md-content>\n" +
    "");
  $templateCache.put("/app/sections/forgot-password/forgot-password.html",
    "<md-content flex layout=\"row\" layout-align=\"center center\">\n" +
    "    <div flex-sm=\"80\" flex-gt-sm=\"60\" layout=\"column\">\n" +
    "        <md-whiteframe class=\"md-whiteframe-1dp\" >\n" +
    "						<md-content class=\"md-padding\">\n" +
    "								<md-button type=\"button\" aria-label=\"Back\" class=\"md-raised\" ui-sref=\"login\">\n" +
    "										<i class=\"fa fa-chevron-left\" aria-hidden=\"true\"></i>\n" +
    "								</md-button>\n" +
    "								<form name=\"form\" layout=\"column\">\n" +
    "										<div flex layout=\"row\" layout-align=\"center center\" md-primary-color>\n" +
    "												<img class=\"outterpage-logo\" src=\"assets/images/logo-new.png\" />\n" +
    "										</div>\n" +
    "										<p class=\"text-center\">If you’ve forgotten your password, you can request a new password via email.</p>\n" +
    "										<md-input-container flex>\n" +
    "												<label>Email</label>\n" +
    "												<input type=\"text\"\n" +
    "															 ng-model=\"data.email\"\n" +
    "															 required\n" +
    "															 ng-pattern=\"/^[_a-z0-9]+(\\.[_a-z0-9]+)*@[a-z0-9-]+(\\.[a-z0-9-]+)*(\\.[a-z]{2,4})$/\">\n" +
    "										</md-input-container>\n" +
    "										<md-button class=\"md-raised md-primary\" type=\"button\" ng-click=\"forgotPassword()\" pull-right ng-disabled=\"form.$invalid || loading\">\n" +
    "												<span ng-show=\"!loading\">Reset password</span>\n" +
    "												<span ng-show=\"loading\"><i class=\"fa fa-cog fa-spin\"></i> Please wait..</span>\n" +
    "										</md-button>\n" +
    "								</form>\n" +
    "						</md-content>\n" +
    "        </md-whiteframe>\n" +
    "    </div>\n" +
    "</md-content>\n" +
    "");
  $templateCache.put("/app/sections/home/home.html",
    "<div ng-show=\"!loading\">\n" +
    "		<!-- <p>Welcome back {{session.first_name}} {{session.last_name}}!</p>\n" +
    "		<p ng-if=\"session.role == 'user'\">\n" +
    "				Currently there are {{totals.activeCoupons}} active {{totals.activeCoupons == 1 ? 'coupon' : 'coupons'}} for your stores.\n" +
    "		</p>\n" +
    "		<p ng-if=\"session.role == 'sc-user'\">\n" +
    "				You have {{totals.newMerchants}} new merchants registered in your shopping center this week. Currently there are {{totals.activeCoupons}} active coupons in your shopping center.\n" +
    "		</p>\n" +
    "		<p ng-if=\"session.role == 'admin'\">\n" +
    "				You have {{totals.newMerchants}} new merchant accounts and {{totals.newShoppingCenters}} new shopping centers registered this week. <br></br> <br>\n" +
    "				Currently there are {{totals.activeCoupons}} active coupons in system.\n" +
    "		</p> -->\n" +
    "		<div ng-if=\"session.role == 'admin' || session.role == 'sc-user'\" layout=\"row\" layout-align=\"center center\">\n" +
    "		  <div flex class=\"dashboard-cards card-users\" >\n" +
    "		    <div layout=\"row\" class=\"dashboard-users \">\n" +
    "		    	<div flex=\"66\" layout=\"column\" layout-align=\"start start\">\n" +
    "		    		<span class=\"icon-lic-users\"></span>\n" +
    "		    	</div>\n" +
    "		    	<div class=\"dashboard-numbers\" flex=\"33\" layout=\"column\" layout-align=\"end end\">\n" +
    "		    		<p class=\"number\">{{stats.users}}</p>\n" +
    "			    	<p>Users</p>\n" +
    "		    	</div>\n" +
    "		    </div>\n" +
    "		    <div layout=\"row\" class=\"dashboard-users-info\">\n" +
    "		    	<a ng-click=\"redirectToUsers()\">View details</a>\n" +
    "		    </div>\n" +
    "		  </div>\n" +
    "		  <div flex class=\"dashboard-cards card-merchants\">\n" +
    "		     <div layout=\"row\" class=\"dashboard-users\">\n" +
    "		    	<div flex=\"66\" layout=\"column\" layout-align=\"start start\">\n" +
    "		    		<span class=\"icon-lic-merchants\"></span>\n" +
    "		    	</div>\n" +
    "		    	<div class=\"dashboard-numbers\" flex=\"33\" layout=\"column\" layout-align=\"end end\">\n" +
    "		    		<p class=\"number\">{{stats.merchants}}</p>\n" +
    "			    	<p>Merchants</p>\n" +
    "		    	</div>\n" +
    "		    </div>\n" +
    "		    <div layout=\"row\" class=\"dashboard-users-info\">\n" +
    "		    	<a ng-click=\"redirectToMerchants()\">View details</a>\n" +
    "		    </div>\n" +
    "		  </div>\n" +
    "		  <div flex class=\"dashboard-cards card-coupons\">\n" +
    "		     <div  layout=\"row\" class=\"dashboard-users\">\n" +
    "		    	<div flex=\"66\" layout=\"column\" layout-align=\"start start\">\n" +
    "		    		<span class=\"icon-lic-coupon\"></span>\n" +
    "		    	</div>\n" +
    "		    	<div class=\"dashboard-numbers\" flex=\"33\" layout=\"column\" layout-align=\"end end\">\n" +
    "		    		<p class=\"number\">{{stats.coupons}}</p>\n" +
    "			    	<p>Coupons</p>\n" +
    "		    	</div>\n" +
    "		    </div>\n" +
    "		    <div layout=\"row\" class=\"dashboard-users-info\">\n" +
    "		    	View details\n" +
    "		    </div>\n" +
    "		  </div>\n" +
    "		</div>\n" +
    "\n" +
    "		<div ng-if=\"session.role == 'user'\" layout=\"row\" layout-align=\"start start\">\n" +
    "			<div flex=\"33\" layout=\"columm\" layout-align=\"start start\" >\n" +
    "		     <md-list flex>\n" +
    "\n" +
    "			  <md-subheader class=\"md-no-sticky\">Profile information</md-subheader>\n" +
    "			  <md-list-item>\n" +
    "			  	<img ng-src=\"{{merchant.logo}}\" alt=\"\">\n" +
    "			  </md-list-item>\n" +
    "			  <md-list-item>\n" +
    "			    <p>Name: {{ merchant.name }} </p>\n" +
    "			  </md-list-item>\n" +
    "\n" +
    "			  <md-divider></md-divider>\n" +
    "\n" +
    "			   <md-list-item>\n" +
    "			    <p>Description: {{ merchant.description }} </p>\n" +
    "			  </md-list-item>\n" +
    "\n" +
    "			  <md-divider></md-divider>\n" +
    "\n" +
    "			   <md-list-item>\n" +
    "			    <p>Shopping Center: {{ merchant.shopping_center_name }} </p>\n" +
    "			  </md-list-item>\n" +
    "\n" +
    "			  <md-divider></md-divider>\n" +
    "\n" +
    "			   <md-list-item>\n" +
    "			    <p>Zip: {{ merchant.zip }} </p>\n" +
    "			  </md-list-item>\n" +
    "\n" +
    "			  <md-divider></md-divider>\n" +
    "\n" +
    "			   <md-list-item>\n" +
    "			    <p>Address: {{ merchant.address }} </p>\n" +
    "			  </md-list-item>\n" +
    "\n" +
    "			  <md-divider></md-divider>\n" +
    "\n" +
    "			   <md-list-item>\n" +
    "			    <p>Suite no: {{ merchant.suite_number }} </p>\n" +
    "			  </md-list-item>\n" +
    "\n" +
    "			  <md-divider></md-divider>\n" +
    "\n" +
    "			   <md-list-item>\n" +
    "			    <p>City: {{ merchant.city }} </p>\n" +
    "			  </md-list-item>\n" +
    "\n" +
    "			  <md-divider></md-divider>\n" +
    "\n" +
    "			   <md-list-item>\n" +
    "			    <p>Latitude: {{ merchant.lat }} </p>\n" +
    "			  </md-list-item>\n" +
    "\n" +
    "			  <md-divider></md-divider>\n" +
    "\n" +
    "			   <md-list-item>\n" +
    "			    <p>Longitude: {{ merchant.lon }} </p>\n" +
    "			  </md-list-item>\n" +
    "\n" +
    "			   <md-divider></md-divider>\n" +
    "\n" +
    "			   <md-list-item>\n" +
    "			    <p>Phone: {{ merchant.phone }} </p>\n" +
    "			  </md-list-item>\n" +
    "\n" +
    "			  <md-divider></md-divider>\n" +
    "\n" +
    "			   <md-list-item>\n" +
    "			    <p>Website: {{ merchant.website }} </p>\n" +
    "			  </md-list-item>\n" +
    "\n" +
    "			   <md-divider></md-divider>\n" +
    "\n" +
    "			   <md-list-item>\n" +
    "			    <p>Category: {{ merchant.categories[0].name }} </p>\n" +
    "			  </md-list-item>\n" +
    "\n" +
    "			</md-list>\n" +
    "		  </div>\n" +
    "		  <div flex=\"33\" class=\"dashboard-cards card-coupons\">\n" +
    "		     <div  layout=\"row\" class=\"dashboard-users\">\n" +
    "		    	<div flex=\"66\" layout=\"column\" layout-align=\"start start\">\n" +
    "		    		<span class=\"icon-lic-coupon\"></span>\n" +
    "		    	</div>\n" +
    "		    	<div class=\"dashboard-numbers\" flex=\"33\" layout=\"column\" layout-align=\"end end\">\n" +
    "		    		<p class=\"number\">{{stats.coupons}}</p>\n" +
    "			    	<p>Coupons</p>\n" +
    "		    	</div>\n" +
    "		    </div>\n" +
    "		    <div layout=\"row\" class=\"dashboard-users-info\">\n" +
    "		    	View details\n" +
    "		    </div>\n" +
    "		  </div>\n" +
    "		</div>\n" +
    "\n" +
    "		<div flex=\"100\" layout=\"row\">\n" +
    "			<zingchart id=\"myChart\" zc-json=\"myJson\" zc-height=500 zc-width=900></zingchart>\n" +
    "		</div>\n" +
    "		\n" +
    "\n" +
    "		<!-- Chart morris -->\n" +
    "\n" +
    "		<div flex layout=\"row\">\n" +
    "            <!-- <div class=\"chart-container-wrapper\" layout=\"column\" flex=\"66\">  \n" +
    "            	<div class=\"chart-container\">\n" +
    "            		<md-toolbar class=\"md-primary\">\n" +
    "				    <div class=\"md-toolbar-tools\">\n" +
    "				    <p>Toolbar with grouped panels (Maximum open: 2)</p>\n" +
    "				    <span flex></span>\n" +
    "				    <md-select ng-model=\"weapon\" placeholder=\"Weapon\" class=\"md-no-underline\">\n" +
    "				        <md-option value=\"axe\">Axe</md-option>\n" +
    "				        <md-option value=\"sword\">Sword</md-option>\n" +
    "						<md-option value=\"wand\">Wand</md-option>\n" +
    "				        <md-option value=\"pen\">Pen?</md-option>\n" +
    "			        </md-select>\n" +
    "				    </div>\n" +
    "				</md-toolbar>\n" +
    "\n" +
    "			  	<md-content flex layout-padding>\n" +
    "			 		<div id=\"morris-area-chart\"></div>\n" +
    "			  	</md-content>\n" +
    "            	</div>\n" +
    "		  	</div> -->\n" +
    "		  	<span flex=\"33\"></span>\n" +
    "		</div>\n" +
    "              \n" +
    "</div>\n" +
    "            <!-- /.row -->\n" +
    "<div ng-show=\"loading\">Please wait...</div>\n" +
    "\n" +
    "");
  $templateCache.put("/app/sections/layout/layout.html",
    "<div layout=\"row\" flex>\n" +
    "    <md-sidenav class=\"md-sidenav-left md-whiteframe-z1\" md-component-id=\"left\" md-is-locked-open=\"isPixieOpen() && $mdMedia('gt-md')\" ng-cloak>\n" +
    "        <div layout=\"column\" layout-fill flex>\n" +
    "            <md-toolbar class=\"md-hue-3 md-whiteframe-z1\" layout=\"row\" layout-align=\"center center\">\n" +
    "                <!-- <h1 class=\"md-toolbar-tools\">LIC Admin</h1> -->\n" +
    "                <img src=\"assets/images/logo-new.png\" alt=\"\">\n" +
    "                <md-button href class=\"md-icon-button\" ng-click=\"close()\" hide-gt-md aria-label=\"Close\">\n" +
    "                    <i class=\"fa fa-angle-double-left md-title\"></i>\n" +
    "                </md-button>\n" +
    "            </md-toolbar>\n" +
    "            <md-content class=\"lic-sidebar\" flex layout=\"column\" layout-wrap>\n" +
    "                <md-button type=\"button\"\n" +
    "                           class=\"md-primary sidenav-btn\"\n" +
    "                           ui-sref=\"layout.home\" ui-sref-active=\"md-raised\"><span class=\"icon-lic-dashboard\"></span>Home</md-button>\n" +
    "                <md-button type=\"button\"\n" +
    "                           ng-if=\"session.role == 'admin' || session.role == 'sc-user'\"\n" +
    "                           class=\"md-primary sidenav-btn\"\n" +
    "                           ui-sref=\"layout.merchant\" ui-sref-active=\"md-raised\" ng-class=\"{'md-raised': ((state.name == 'layout.coupons' || state.name == 'layout.merchants-edit.edit') || state.name == 'layout.merchants-edit.kml')}\"><span class=\"icon-lic-merchants\"></span>Merchants</md-button>\n" +
    "                <md-button type=\"button\"\n" +
    "                           ng-if=\"session.role == 'user'\"\n" +
    "                           class=\"md-primary sidenav-btn\"\n" +
    "                           ui-sref=\"layout.merchant\" ui-sref-active=\"md-raised\" ng-class=\"{'md-raised': (state.name == 'layout.merchants-edit.edit' || state.name == 'layout.merchants-edit.kml')}\"><span class=\"icon-lic-merchants\"></span>Merchants</md-button>\n" +
    "                <!--<md-button type=\"button\"-->\n" +
    "                           <!--ng-if=\"session.role == 'admin'\"-->\n" +
    "                           <!--class=\"md-primary sidenav-btn\"-->\n" +
    "                           <!--ui-sref=\"layout.merchant-request\" ui-sref-active=\"md-raised\">Merchants Requests</md-button>-->\n" +
    "                <md-button type=\"button\"\n" +
    "                           class=\"md-primary sidenav-btn\"\n" +
    "                           ng-if=\"session.role == 'admin' || session.role == 'sc-user'\"\n" +
    "                           ui-sref=\"layout.areas\" ui-sref-active=\"md-raised\" ng-class=\"{'md-raised': state.name == 'layout.areas-edit'}\"><span class=\"icon-lic-areas\"></span>Areas</md-button>\n" +
    "                <md-button type=\"button\"\n" +
    "                           class=\"md-primary sidenav-btn\"\n" +
    "                           ng-if=\"session.role == 'admin' || session.role == 'sc-user'\"\n" +
    "                           ui-sref=\"layout.categories\" ui-sref-active=\"md-raised\" ng-class=\"{'md-raised': state.name == 'layout.categories-edit'}\"><span class=\"icon-lic-categories\"></span>Categories</md-button>\n" +
    "               <!--  <md-button type=\"button\"\n" +
    "                           class=\"md-primary sidenav-btn\"\n" +
    "                           ng-if=\"session.role == 'admin' || session.role == 'sc-user'\"\n" +
    "                           ui-sref=\"layout.shopping-centers\" ui-sref-active=\"md-raised\">Shopping Centers</md-button> -->\n" +
    "                <md-button type=\"button\"\n" +
    "                           ng-if=\"session.role == 'admin' || session.role == 'sc-user'\"\n" +
    "                           class=\"md-primary sidenav-btn\"\n" +
    "                           ui-sref=\"layout.users\" ui-sref-active=\"md-raised\" ng-class=\"{'md-raised': (state.name == 'layout.user-edit' || state.name == 'layout.password-change')}\"><span class=\"icon-lic-users\"></span>Users</md-button>\n" +
    "                <md-button type=\"button\"\n" +
    "                           ng-if=\"session.role == 'user'\"\n" +
    "                           class=\"md-primary sidenav-btn\"\n" +
    "                           ng-click=\"openMerchantCoupons()\"\n" +
    "                           ui-sref=\"layout.coupons\" \n" +
    "                           ui-sref-active=\"md-raised\"><span class=\"icon-lic-coupon\"></span>Coupons</md-button>\n" +
    "                <md-button type=\"button\"\n" +
    "                           class=\"md-primary sidenav-btn\"\n" +
    "                           ui-sref=\"layout.push-notification\" ui-sref-active=\"md-raised\"><span class=\"icon-lic-notifications\"></span>Push notification</md-button>\n" +
    "                <md-button type=\"button\"\n" +
    "                           ng-if=\"session.role != 'sc-user'\"\n" +
    "                           class=\"md-primary sidenav-btn\"\n" +
    "                           ng-click=\"openSettings()\"\n" +
    "                           ui-sref=\"layout.settings\" ui-sref-active=\"md-raised\"><span class=\"icon-lic-settings\"></span>Settings</md-button>\n" +
    "                <md-button type=\"button\"\n" +
    "                           ng-if=\"session.role == 'sc-user'\"\n" +
    "                           class=\"md-primary sidenav-btn\"\n" +
    "                           ng-click=\"openShoppingCenter($event)\" ui-sref=\"layout.shopping-settings\" ui-sref-active=\"md-raised\"><span class=\"icon-lic-settings\"></span>Settings</md-button>\n" +
    "            </md-content>\n" +
    "            <!-- ui-sref=\"layout.shopping-settings\" ui-sref-active=\"md-raised\" -->\n" +
    "        </div>\n" +
    "    </md-sidenav>\n" +
    "    <div layout=\"column\" flex>\n" +
    "        <md-toolbar id=\"blue-lic-toolbar\" class=\"md-hue-2 site-content-toolbar md-whiteframe-z1\" layout=\"row\" layout-align=\"start center\" ng-cloak>\n" +
    "            <div class=\"md-toolbar-tools docs-toolbar-tools\" flex>\n" +
    "                <md-button href class=\"md-icon-button\" ng-click=\"toggle()\" hide-gt-md aria-label=\"Close\">\n" +
    "                    <i class=\"fa fa-bars\"></i>\n" +
    "                </md-button>\n" +
    "                <div layout=\"row\" flex>\n" +
    "                    <div flex layout=\"column\" layout-align=\"center start\">\n" +
    "                        <a class=\"back-button\" ng-if=\"isBackActive\" ng-click=\"onBack()\">\n" +
    "                          <span class=\"icon-lic-back\"></span>\n" +
    "                          Back\n" +
    "                        </a>\n" +
    "                    </div>\n" +
    "                    <div flex=\"22\" layout=\"column\" layout-align=\"center end\">\n" +
    "                        <md-menu class=\"site-content-toolbar-button normal-case fill-height\" md-position-mode=\"target-right target\">\n" +
    "                            <md-button aria-label=\"Open phone interactions menu\" ng-click=\"openMenu($mdOpenMenu, $event)\">\n" +
    "                                {{user.first_name}} {{user.last_name}} <i class=\"fa fa-caret-down\" aria-hidden=\"true\"></i>\n" +
    "                            </md-button>\n" +
    "                            <md-menu-content width=\"1\">\n" +
    "                                <md-menu-item>\n" +
    "                                    <md-button ng-click=\"openSettings()\">\n" +
    "                                        <i class=\"fa fa-user\" aria-hidden=\"true\"></i> Profile\n" +
    "                                    </md-button>\n" +
    "                                </md-menu-item>\n" +
    "                                <md-menu-item>\n" +
    "                                    <md-button ng-click=\"openChangePassword()\">\n" +
    "                                        <i class=\"fa fa-key\" aria-hidden=\"true\"></i> Change password\n" +
    "                                    </md-button>\n" +
    "                                </md-menu-item>\n" +
    "                                <md-menu-item>\n" +
    "                                    <md-button ng-click=\"logout()\">\n" +
    "                                        <i class=\"fa fa-power-off\" aria-hidden=\"true\"></i> Logout\n" +
    "                                    </md-button>\n" +
    "                                </md-menu-item>\n" +
    "                            </md-menu-content>\n" +
    "                        </md-menu>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </md-toolbar>\n" +
    "        <md-content layout-padding class=\"md-sidenav-left md-whiteframe-z1\" ui-view layout=\"column\" flex overflow-x=\"hidden\"></md-content>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("/app/sections/login/login.html",
    "<md-content flex layout=\"row\" layout-align=\"center center\">\n" +
    "    <div flex-sm=\"80\" flex-gt-sm=\"60\" layout=\"column\">\n" +
    "        <md-whiteframe class=\"md-whiteframe-1dp\" >\n" +
    "						<md-content class=\"md-padding\">\n" +
    "								<form name=\"form\" layout=\"column\">\n" +
    "										<div flex layout=\"row\" layout-align=\"center center\" md-primary-color>\n" +
    "												<img class=\"outterpage-logo\" src=\"assets/images/logo-new.png\" />\n" +
    "										</div>\n" +
    "										<md-input-container flex>\n" +
    "												<label>Email</label>\n" +
    "												<input type=\"text\"\n" +
    "															 ng-model=\"user.email\"\n" +
    "															 required\n" +
    "															 ng-pattern=\"/^[_a-z0-9]+(\\.[_a-z0-9]+)*@[a-z0-9-]+(\\.[a-z0-9-]+)*(\\.[a-z]{2,4})$/\">\n" +
    "										</md-input-container>\n" +
    "										<md-input-container flex class=\"password-container\">\n" +
    "												<label>Password</label>\n" +
    "												<input type=\"password\" ng-model=\"user.password\" required>\n" +
    "												<a href=\"#\" aria-label=\"Forgot password\" class=\"pull-right\" ui-sref=\"forgot-password\">Forgot password?</a>\n" +
    "										</md-input-container>\n" +
    "										<md-button class=\"md-raised md-primary\" type=\"button\" ng-click=\"login()\" pull-right ng-disabled=\"form.$invalid || loading\">\n" +
    "												<span ng-show=\"!loading\">Login</span>\n" +
    "												<span ng-show=\"loading\"><i class=\"fa fa-cog fa-spin\"></i> Please wait..</span>\n" +
    "										</md-button>\n" +
    "								</form>\n" +
    "						</md-content>\n" +
    "        </md-whiteframe>\n" +
    "    </div>\n" +
    "</md-content>\n" +
    "");
  $templateCache.put("/app/sections/merchant/addEditMerchant/merchantAddEdit-Edit.html",
    "<!-- <md-dialog aria-label=\"Modal\" flex> -->\n" +
    "<div flex layout=\"column\" >\n" +
    "    <span ng-bind=\"merchant.id ? 'Edit Merchant' : 'Add Merchant'\" class=\"padding-bottom table-title\">\n" +
    "    </span>\n" +
    "    <form name=\"form\">\n" +
    "        <!-- <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2 ng-bind=\"merchant.id ? 'Edit Merchant' : 'Add Merchant'\"></h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar> -->\n" +
    "        <md-content flex layout=\"column\" layout-padding>\n" +
    "            <div layout=\"column\">\n" +
    "                <div layout=\"column\">\n" +
    "                    <h4>Merchant Logo</h4>\n" +
    "                    <div ng-if=\"imagePreparedForUpload\" file=\"imagePreparedForUpload._file\" width=\"140\" height=\"140\" ng-thumb></div>\n" +
    "                    <div class=\"merchant-logo-container\" ng-if=\"merchant.logo && !imagePreparedForUpload\">\n" +
    "                        <a href=\"#\" ng-click=\"removeLogo()\"><i class=\"fa fa-minus-circle\" aria-hidden=\"true\"></i></a>\n" +
    "                        <img width=\"140\" height=\"140\" ng-src=\"{{merchant.logo}}\">\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <input type=\"file\" nv-file-select=\"\" uploader=\"uploader\" />\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Name</label>\n" +
    "                        <input name=\"name\" ng-model=\"merchant.name\" required type=\"text\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.name.$error.required\">Enter merchant name</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Description</label>\n" +
    "                        <textarea name=\"description\" minlength=\"3\" required ng-model=\"merchant.description\" rows=\"2\" md-select-on-focus></textarea>\n" +
    "                        <em class=\"error-message\" ng-show=\"form.description.$error.required\">Please enter description</em>\n" +
    "                        <em class=\"error-message\" ng-show=\"form.description.$error.minlength\">Description must be at least 3 characters long</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <div flex>\n" +
    "                        <md-autocomplete md-input-name=\"area\" md-selected-item=\"selectedArea\" md-search-text=\"searchAreaText\" md-selected-item-change=\"selectArea(area)\" required md-items=\"area in loadArea(searchAreaText)\" md-item-text=\"area.name\" md-require-match md-delay=\"300\" md-min-length=\"0\" md-floating-label=\"Area\">\n" +
    "                            <md-item-template>\n" +
    "                                <span md-highlight-text=\"searchAreaText\">{{area.name}}</span>\n" +
    "                            </md-item-template>\n" +
    "                            <md-not-found>\n" +
    "                                No states matching \"{{searchAreaText}}\" were found.\n" +
    "                            </md-not-found>\n" +
    "                            <em class=\"error-message\" ng-show=\"form.area.$error.required\">Please select area</em>\n" +
    "                        </md-autocomplete>\n" +
    "                    </div>\n" +
    "                    <div flex>\n" +
    "                        <md-autocomplete md-selected-item=\"selectedShoppingCenter\" md-no-cache=\"true\" md-search-text=\"searchTextShoppingCenter\" md-selected-item-change=\"selectShoppingCenter(shoppingCenter)\" md-items=\"shoppingCenter in loadShoppingCenters(searchTextShoppingCenter)\" md-item-text=\"shoppingCenter.name\" md-require-match md-delay=\"300\" md-min-length=\"0\" md-floating-label=\"Shopping Center\">\n" +
    "                            <md-item-template>\n" +
    "                                <span md-highlight-text=\"searchTextShoppingCenter\">{{shoppingCenter.name}}</span>\n" +
    "                            </md-item-template>\n" +
    "                            <md-not-found>\n" +
    "                                No states matching \"{{searchTextShoppingCenter}}\" were found.\n" +
    "                            </md-not-found>\n" +
    "                        </md-autocomplete>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex ng-if=\"!merchant.shopping_center_id\">\n" +
    "                        <label>Shopping Center Name</label>\n" +
    "                        <input name=\"shopping_center_name\" ng-model=\"merchant.shopping_center_name\" ng-required=\"!merchant.shopping_center_id || !shoppingCenter.lat || !shoppingCenter.lon\" type=\"text\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.shopping_center_name.$error.required\">Required if shopping center is not selected</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Zip</label>\n" +
    "                        <input ng-model=\"merchant.zip\" name=\"zip\" ng-change=\"geoLocationByZip(merchant.zip)\" ng-required=\"!merchant.shopping_center_id\" type=\"text\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.zip.$error.required\">Please enter ZIP code</em>\n" +
    "                    </md-input-container>\n" +
    "                    <div layout=\"row\">\n" +
    "                        <md-input-container flex>\n" +
    "                            <label>Address</label>\n" +
    "                            <input name=\"address\" ng-model=\"merchant.address\" ng-required=\"!merchant.shopping_center_id\" ng-disabled=\"loadingByZip\" type=\"text\">\n" +
    "                            <em class=\"error-message\" ng-show=\"form.address.$error.required\">Please enter address</em>\n" +
    "                        </md-input-container>\n" +
    "                        <md-input-container flex>\n" +
    "                            <label>Suite number</label>\n" +
    "                            <input name=\"suite_number\" ng-model=\"merchant.suite_number\" ng-required=\"!merchant.address\" ng-disabled=\"loadingByZip\" type=\"text\">\n" +
    "                            <em class=\"error-message\" ng-show=\"form.suite_number.$error.required\">Please enter suite number</em>\n" +
    "                        </md-input-container>\n" +
    "                    </div>\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>City</label>\n" +
    "                        <input ng-model=\"merchant.city\" name=\"city\" ng-required=\"!merchant.shopping_center_id\" ng-disabled=\"loadingByZip\" required type=\"text\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.city.$error.required\">Please enter city name</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Latitude</label>\n" +
    "                        <input name=\"lat\" ng-model=\"merchant.lat\" required ng-disabled=\"loadingByZip\" type=\"number\" step=\"any\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.lat.$error.required\">Please enter latitude</em>\n" +
    "                    </md-input-container>\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Longitude</label>\n" +
    "                        <input name=\"lon\" ng-model=\"merchant.lon\" required ng-disabled=\"loadingByZip\" type=\"number\" step=\"any\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.lon.$error.required\">Please enter Longitude</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Phone</label>\n" +
    "                        <input ng-model=\"merchant.phone\" type=\"text\">\n" +
    "                    </md-input-container>\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Website</label>\n" +
    "                        <input ng-model=\"merchant.website\" type=\"text\">\n" +
    "                        <em>* http://www.example.com</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"column\">\n" +
    "                    <md-input-container flex md-no-float>\n" +
    "                        <label></label>\n" +
    "                        <tags-input ng-model=\"merchant.categories\" replaces-spaces-with-dashes=\"false\" aria-label=\"Category\" placeholder=\"Add Category\" debounce-delay=\"100\" key-property=\"id\" display-property=\"name\" add-from-autocomplete-only=\"true\" max-results-to-show=\"10\">\n" +
    "                            <auto-complete source=\"loadCategories($query)\" aria-label=\"Category\" load-on-focus=\"true\" load-on-empty=\"true\" min-length=\"0\" debounce-delay=\"100\"></auto-complete>\n" +
    "                        </tags-input>\n" +
    "                        <em ng-if=\"categoryLoading\">Please wait...</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </md-content>\n" +
    "        <section layout=\"row\">\n" +
    "            <!-- <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button> -->\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading\">\n" +
    "                <span ng-show=\"!loading && !merchant.id\"><span class=\"icon-lic-save btn-icon\"></span> Save</span>\n" +
    "                <span ng-show=\"!loading && merchant.id\"><span class=\"icon-lic-update btn-icon\"></span> Update</span>\n" +
    "                <span ng-show=\"loading\">Please wait...</span>\n" +
    "            </md-button>\n" +
    "            <md-button type=\"button\" ng-click=\"nextStep()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading\">\n" +
    "                <span ng-show=\"!loading\">Next <span class=\"icon-lic-right-arrow btn-icon\"></span></span>\n" +
    "            </md-button>\n" +
    "        </section>\n" +
    "    </form>\n" +
    "</div>\n" +
    "<!-- </md-dialog> -->\n" +
    "");
  $templateCache.put("/app/sections/merchant/addEditMerchant/merchantAddEdit-KML.html",
    "<!-- <md-dialog aria-label=\"Modal\" flex> -->\n" +
    "	<style type=\"text/css\">\n" +
    "\n" +
    "            #panel {\n" +
    "                width: 200px;\n" +
    "                font-family: Arial, sans-serif;\n" +
    "                font-size: 13px;\n" +
    "                float: right;\n" +
    "                margin: 10px;\n" +
    "            }\n" +
    "\n" +
    "            #color-palette {\n" +
    "                clear: both;\n" +
    "            }\n" +
    "\n" +
    "            .color-button {\n" +
    "                width: 14px;\n" +
    "                height: 14px;\n" +
    "                font-size: 0;\n" +
    "                margin: 2px;\n" +
    "                float: left;\n" +
    "                cursor: pointer;\n" +
    "            }\n" +
    "\n" +
    "            #delete-button {\n" +
    "                margin-top: 5px;\n" +
    "            }\n" +
    "        </style>\n" +
    "<div flex layout=\"column\" >\n" +
    "    <span class=\"padding-bottom table-title\">KML Map</span>\n" +
    "    <div id=\"panel\">\n" +
    "        <md-button class=\"md-warn md-raised\" id=\"delete-button\"><span class=\"icon-lic-delete btn\"></span> Delete Selected Shape</md-button>\n" +
    "        <md-button type=\"button\" ng-click=\"save(lat_longs_string)\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading\">\n" +
    "            <span ng-show=\"!loading && !merchant.id\"><span class=\"icon-lic-save btn-icon\"></span> Save</span>\n" +
    "            <span ng-show=\"!loading && merchant.id\"><span class=\"icon-lic-update btn-icon\"></span> Update</span>\n" +
    "            <span ng-show=\"loading\">Please wait...</span>\n" +
    "        </md-button>\n" +
    "    </div>\n" +
    "    <div id=\"map\" style=\"height: 100vh;\">Error</div>\n" +
    "</div>\n" +
    "<!-- </md-dialog> -->\n" +
    "<script>\n" +
    "	\n" +
    "</script>");
  $templateCache.put("/app/sections/merchant/addEditMerchant/merchantAddEdit.html",
    "<div layout=\"row\" layout-align=\"center\" id=\"status-buttons\" class=\"text-center\">\n" +
    "    <a class=\"nav-stepper\" layout=\"row\" layout-align=\"center center\" ui-sref-active=\"active\" ui-sref=\".edit\">\n" +
    "        <span class=\"icon-lic-f-one btn-icon\"><span class=\"path1\"></span><span class=\"path2\"></span></span><div>\n" +
    "            <!-- {{merchant.id ? ' - Edit Merchant' : ' - Add Merchant'}} -->\n" +
    "        </div>\n" +
    "    </a>\n" +
    "    <a class=\"nav-stepper step_two\" layout=\"row\" layout-align=\"center center\" ui-sref-active=\"active\" ui-sref=\".kml\">\n" +
    "         <span class=\"icon-lic-f-two btn-icon\"><span class=\"path1\"></span><span class=\"path2\"></span></span><div></div>\n" +
    "    </a>\n" +
    "</div>\n" +
    "<div layout=\"row\" id=\"merchant-stepper\" ui-view></div>");
  $templateCache.put("/app/sections/merchant/coupon/addEditCoupon/couponAddEdit.html",
    "<!-- <md-dialog aria-label=\"Modal\" flex> -->\n" +
    "<div flex layout=\"column\" >\n" +
    "    <span class=\"table-title\" ng-bind=\"coupon.id ? 'Edit Coupon' : 'Add Coupon'\"></span>\n" +
    "    <form name=\"form\">\n" +
    "       <!--  <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2></h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar> -->\n" +
    "        <md-content flex layout=\"column\" layout-padding>\n" +
    "            <div layout=\"column\">\n" +
    "                <md-input-container flex>\n" +
    "                    <label>Title</label>\n" +
    "                    <input ng-model=\"coupon.title\" required type=\"text\">\n" +
    "                </md-input-container>\n" +
    "                <md-input-container flex>\n" +
    "                    <label>Description</label>\n" +
    "                    <textarea maxlength=\"200\" ng-model=\"coupon.description\" required rows=\"3\" md-select-on-focus></textarea>\n" +
    "                    <em pull-right>{{coupon.description.length ? coupon.description.length : 0}}/200</em>\n" +
    "                </md-input-container>\n" +
    "            </div>\n" +
    "            <div layout=\"row\">\n" +
    "                <md-input-container flex>\n" +
    "                    <label>Start Date</label>\n" +
    "                    <md-datepicker ng-model=\"coupon.start_date\"\n" +
    "                                   md-placeholder=\"Start Date\"\n" +
    "                                   md-open-on-focus></md-datepicker>\n" +
    "                </md-input-container>\n" +
    "                <md-input-container flex>\n" +
    "                    <label>End Date</label>\n" +
    "                    <md-datepicker ng-model=\"coupon.end_date\"\n" +
    "                                   md-placeholder=\"End Date\"\n" +
    "                                   md-open-on-focus></md-datepicker>\n" +
    "                </md-input-container>\n" +
    "            </div>\n" +
    "            <md-content class=\"md-padding\">\n" +
    "                            <div layout=\"column\">\n" +
    "                                <br />\n" +
    "                                <div ng-show=\"uploader.isHTML5\" style=\"padding: 20px;\" nv-file-drop class=\"my-drop-zone\" nv-file-over=\"\" uploader=\"uploader\">\n" +
    "                                    <span class=\"drag-img\"></span>\n" +
    "                                    <span class=\"drag-text\"> Drag & drop files here</span>\n" +
    "                                </div>\n" +
    "                                <input ng-show=\"!uploader.isHTML5\" type=\"file\" nv-file-select=\"\" uploader=\"uploader\" multiple /><br />\n" +
    "                                <em class=\"text-right\">* only PDF and images are allowed</em>\n" +
    "                                <br />\n" +
    "\n" +
    "                                <div layout=\"row\" flex ng-show=\"uploader.queue.length > 0\">\n" +
    "                                    <table md-table class=\"table\">\n" +
    "                                        <thead md-head>\n" +
    "                                            <tr md-row>\n" +
    "                                                <th md-column width=\"50%\">Name</th>\n" +
    "                                                <th md-column ng-show=\"uploader.isHTML5\">Size</th>\n" +
    "                                                <th md-column ng-show=\"uploader.isHTML5\">Progress</th>\n" +
    "                                                <th md-column>Status</th>\n" +
    "                                                <th md-column>Actions</th>\n" +
    "                                            </tr>\n" +
    "                                        </thead>\n" +
    "                                        <tbody md-body>\n" +
    "                                            <tr md-row ng-repeat=\"item in uploader.queue\">\n" +
    "                                                <td md-cell><strong>{{ item.file.name }}</strong></td>\n" +
    "                                                <td md-cell ng-show=\"uploader.isHTML5\" nowrap>{{ item.file.size/1024/1024|number:2 }} MB</td>\n" +
    "                                                <td md-cell ng-show=\"uploader.isHTML5\">\n" +
    "                                                    <div class=\"progress\" style=\"margin-bottom: 0;\">\n" +
    "                                                        <div class=\"progress-bar\" role=\"progressbar\" ng-style=\"{ 'width': item.progress + '%' }\"></div>\n" +
    "                                                    </div>\n" +
    "                                                </td>\n" +
    "                                                <td md-cell class=\"text-center\">\n" +
    "                                                    <span ng-show=\"item.isSuccess\"><i class=\"fa fa-check\" aria-hidden=\"true\"></i></span>\n" +
    "                                                    <span ng-show=\"item.isCancel\"><i class=\"fa fa-ban\" aria-hidden=\"true\"></i></span>\n" +
    "                                                    <span ng-show=\"item.isError\"><i class=\"fa fa-exclamation\" aria-hidden=\"true\"></i></span>\n" +
    "                                                </td>\n" +
    "                                                <td md-cell nowrap>\n" +
    "                                                    <md-button type=\"button\" aria-label=\"Delete\" class=\"md-raised\" ng-click=\"item.remove()\">\n" +
    "                                                        <i class=\"fa fa-trash\" aria-hidden=\"true\"></i>\n" +
    "                                                    </md-button>\n" +
    "                                                </td>\n" +
    "                                            </tr>\n" +
    "                                        </tbody>\n" +
    "                                    </table>\n" +
    "                                    <div>\n" +
    "                                        <div>\n" +
    "                                            <md-progress-linear md-mode=\"determinate\" value=\"{{uploader.progress}}\"></md-progress-linear>\n" +
    "                                        </div>\n" +
    "                                    </div>\n" +
    "                                </div>\n" +
    "                                <div ng-if=\"coupon.files.length\">\n" +
    "                                    <span>Files:</span>\n" +
    "                                    <div layout=\"row\">\n" +
    "                                        <md-card md-theme=\"default\" ng-repeat=\"file in coupon.files\" md-theme-watch>\n" +
    "                                            <a href=\"{{file.url}}\" target=\"_blank\">\n" +
    "                                                <img ng-if=\"file.extension != 'pdf' && file.extension != 'txt'\" layout-padding ng-src=\"{{file.url}}\" alt=\"Image\" style=\"height: 200px; width: 200px;\" />\n" +
    "                                                <div ng-if=\"file.extension == 'pdf' || file.extension == 'txt'\" layout-padding style=\"height: 200px; width: 200px;\" class=\"text-center\">\n" +
    "                                                    <i class=\"fa fa-file-text-o fa-5x\" aria-hidden=\"true\"></i>\n" +
    "                                                </div>\n" +
    "                                            </a>\n" +
    "                                            <md-card-actions layout=\"row\" layout-align=\"end center\">\n" +
    "                                                <md-button ng-click=\"removeFile(file)\">\n" +
    "                                                    <span ng-show=\"!file.loading\">Delete</span>\n" +
    "                                                    <span ng-show=\"file.loading\">Please wait...</span>\n" +
    "                                                </md-button>\n" +
    "                                            </md-card-actions>\n" +
    "                                        </md-card>\n" +
    "                                    </div>\n" +
    "                                </div>\n" +
    "                            </div>\n" +
    "                        </md-content>\n" +
    "\n" +
    "        </md-content>\n" +
    "        <section layout=\"row\">\n" +
    "            <!-- <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button> -->\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading\">\n" +
    "                <span ng-show=\"!loading\"><span class=\"icon-lic-save btn-icon\"></span> Save</span>\n" +
    "                <span ng-show=\"loading\"><i class=\"fa fa-cog fa-spin\"></i> Please wait...</span>\n" +
    "            </md-button>\n" +
    "        </section>\n" +
    "    </form>\n" +
    "</div>\n" +
    "<!-- </md-dialog> -->\n" +
    "\n" +
    "");
  $templateCache.put("/app/sections/merchant/coupon/coupon.html",
    "<div>\n" +
    "    <h4 ng-if=\"loading\" class=\"text-center\">Please wait...</h4>\n" +
    "    <div layout=\"column\" ng-if=\"!loading\">\n" +
    "        <span class=\"table-title\">Coupons for {{merchant.name}}</span>\n" +
    "        <div layout=\"row\">\n" +
    "						<!-- <md-input-container>\n" +
    "								<md-button class=\"md-raised\" aria-label=\"back\" ng-click=\"goBack()\">\n" +
    "										<i class=\"fa fa-arrow-left\" aria-hidden=\"true\"></i>\n" +
    "								</md-button>\n" +
    "						</md-input-container> -->\n" +
    "						<md-input-container class=\"sort-by-container-fix\">\n" +
    "								<label>Sort by</label>\n" +
    "								<md-select ng-change=\"sortBy()\" ng-model=\"params.sort_by\">\n" +
    "										<md-option value=\"-active\">Active State</md-option>\n" +
    "										<md-option value=\"active\">Inactive State</md-option>\n" +
    "										<md-option value=\"start_date\">Date Start</md-option>\n" +
    "										<md-option value=\"end_date\">Date End</md-option>\n" +
    "								</md-select>\n" +
    "						</md-input-container>\n" +
    "						<md-input-container class=\"padd\">\n" +
    "								<md-button class=\"md-raised md-primary\" ng-click=\"openCouponAdd()\" aria-label=\"Add Coupon\">\n" +
    "										<span class=\"icon-lic-add btn-icon\"></span> Add Coupon\n" +
    "								</md-button>\n" +
    "						</md-input-container>\n" +
    "                        <md-input-container class=\"padd\">\n" +
    "                                <md-button class=\"md-raised md-primary\" ng-click=\"openPixieEditor()\" aria-label=\"Create Coupon\">\n" +
    "                                       <span class=\"icon-lic-magic btn-icon\"></span> Create Coupon\n" +
    "                                </md-button>\n" +
    "                        </md-input-container>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"md-padding\" layout=\"row\" layout-wrap ng-if=\"!loading\">\n" +
    "        <md-card class=\"coupon-card-shadow\" md-theme=\"default\" md-theme-watch ng-repeat=\"coupon in coupons\">\n" +
    "            <md-card-title>\n" +
    "                <md-card-title-text>\n" +
    "                    <span class=\"md-headline\">Title: {{coupon.title}}</span>\n" +
    "										<span class=\"md-subhead\">\n" +
    "												Date: {{coupon.start_date}} - {{coupon.end_date}}\n" +
    "												<p class=\"fix-margin\">Status: {{coupon.active ? 'Active': 'Inactive'}}</p>\n" +
    "										</span>\n" +
    "                    <div layout=\"row\" style=\"width:300px\">{{coupon.description}}</div>\n" +
    "                </md-card-title-text>\n" +
    "                <md-card-title-media>\n" +
    "                    <div class=\"md-media-md card-media\">\n" +
    "                        <!-- <i ng-if=\"!coupon.image.url\" class=\"fa fa-picture-o\" aria-hidden=\"true\"></i> -->\n" +
    "                        <span ng-if=\"!coupon.image.url\" class=\"icon-lic-image\" aria-hidden=\"true\"></span>\n" +
    "                        <img ng-if=\"coupon.image.url\" ng-src=\"{{coupon.image.url}}\" />\n" +
    "                    </div>\n" +
    "                </md-card-title-media>\n" +
    "            </md-card-title>\n" +
    "            <md-card-actions layout=\"row\" layout-align=\"end center\">\n" +
    "                <md-button class=\"edit-color\"\n" +
    "                           ng-click=\"openCouponEdit(coupon)\"\n" +
    "                           ng-disabled=\"coupon.toggleLoading\">\n" +
    "                    <span class=\"icon-lic-edit btn-icon\"></span> Edit\n" +
    "                </md-button>\n" +
    "                <md-button ng-class=\"{'active-color': !coupon.active}\" ng-disabled=\"coupon.toggleLoading\" ng-click=\"toggleActive(coupon)\">\n" +
    "                    <span ng-show=\"coupon.toggleLoading\"><i class=\"fa fa-cog fa-spin\"></i> Please wait...</span>\n" +
    "                    <span class=\"inactive-color\" ng-show=\"coupon.active && !coupon.toggleLoading\">\n" +
    "                        <span class=\"icon-lic-inactive btn-icon\"></span> Deactivate\n" +
    "                    </span>\n" +
    "                    <span ng-show=\"!coupon.active && !coupon.toggleLoading\">\n" +
    "                        <span class=\"icon-lic-active btn-icon\"></span> Activate\n" +
    "                    </span>\n" +
    "                </md-button>\n" +
    "                <md-button class=\"delete-color\"\n" +
    "                           ng-click=\"removeModal($event, coupon)\"\n" +
    "                           ng-disabled=\"coupon.toggleLoading || coupon.deleteLoading\">\n" +
    "                    <span ng-show=\"coupon.deleteLoading\"><i class=\"fa fa-cog fa-spin\"></i> Please wait...</span>\n" +
    "                    <span ng-show=\"!coupon.deleteLoading\">\n" +
    "                        <span class=\"icon-lic-delete btn-icon\"></span> Delete\n" +
    "                    </span>\n" +
    "                </md-button>\n" +
    "            </md-card-actions>\n" +
    "        </md-card>\n" +
    "    </div>\n" +
    "    <h4 ng-show=\"!loading && !total && !params.search\" class=\"text-center\">Currently there no coupones in your database for {{merchant.name}}.</h4>\n" +
    "    <md-table-pagination ng-if=\"total > 0\"\n" +
    "                         md-options=\"[10, 20, 30]\"\n" +
    "                         md-limit=\"params.limit\"\n" +
    "                         md-page=\"params.page\"\n" +
    "                         md-total=\"{{total}}\"\n" +
    "                         md-on-paginate=\"onPaginate\"\n" +
    "                         md-page-select></md-table-pagination>\n" +
    "</div>\n" +
    "");
  $templateCache.put("/app/sections/merchant/coupon/modals/couponModal.html",
    "<md-dialog aria-label=\"Modal\" flex>\n" +
    "    <form name=\"form\">\n" +
    "        <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2 ng-bind=\"coupon.id ? 'Edit Coupon' : 'Add Coupon'\"></h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar>\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"md-dialog-content\">\n" +
    "                <md-tabs md-dynamic-height md-border-bottom md-stretch-tabs=\"always\">\n" +
    "                    <md-tab label=\"Details\">\n" +
    "                        <md-content class=\"md-padding\">\n" +
    "                            <div layout=\"column\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Title</label>\n" +
    "                                    <input ng-model=\"coupon.title\" required type=\"text\">\n" +
    "                                </md-input-container>\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Description</label>\n" +
    "                                    <textarea maxlength=\"200\" ng-model=\"coupon.description\" required rows=\"3\" md-select-on-focus></textarea>\n" +
    "                                    <em pull-right>{{coupon.description.length ? coupon.description.length : 0}}/200</em>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                            <div layout=\"row\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Start Date</label>\n" +
    "                                    <md-datepicker ng-model=\"coupon.start_date\"\n" +
    "                                                   md-placeholder=\"Start Date\"\n" +
    "                                                   md-open-on-focus></md-datepicker>\n" +
    "                                </md-input-container>\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>End Date</label>\n" +
    "                                    <md-datepicker ng-model=\"coupon.end_date\"\n" +
    "                                                   md-placeholder=\"End Date\"\n" +
    "                                                   md-open-on-focus></md-datepicker>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                        </md-content>\n" +
    "                    </md-tab>\n" +
    "                    <md-tab label=\"Files\">\n" +
    "                        <md-content class=\"md-padding\">\n" +
    "                            <div layout=\"column\">\n" +
    "                                <br />\n" +
    "                                <div ng-show=\"uploader.isHTML5\" style=\"padding: 20px;\" nv-file-drop class=\"my-drop-zone\" nv-file-over=\"\" uploader=\"uploader\">\n" +
    "                                    <span class=\"drag-img\"></span>\n" +
    "                                    <span class=\"drag-text\"> Drag & drop files here</span>\n" +
    "                                </div>\n" +
    "                                <input ng-show=\"!uploader.isHTML5\" type=\"file\" nv-file-select=\"\" uploader=\"uploader\" multiple /><br />\n" +
    "                                <em class=\"text-right\">* only PDF and images are allowed</em>\n" +
    "                                <br />\n" +
    "\n" +
    "                                <div layout=\"row\" flex ng-show=\"uploader.queue.length > 0\">\n" +
    "                                    <table md-table class=\"table\">\n" +
    "                                        <thead md-head>\n" +
    "                                            <tr md-row>\n" +
    "                                                <th md-column width=\"50%\">Name</th>\n" +
    "                                                <th md-column ng-show=\"uploader.isHTML5\">Size</th>\n" +
    "                                                <th md-column ng-show=\"uploader.isHTML5\">Progress</th>\n" +
    "                                                <th md-column>Status</th>\n" +
    "                                                <th md-column>Actions</th>\n" +
    "                                            </tr>\n" +
    "                                        </thead>\n" +
    "                                        <tbody md-body>\n" +
    "                                            <tr md-row ng-repeat=\"item in uploader.queue\">\n" +
    "                                                <td md-cell><strong>{{ item.file.name }}</strong></td>\n" +
    "                                                <td md-cell ng-show=\"uploader.isHTML5\" nowrap>{{ item.file.size/1024/1024|number:2 }} MB</td>\n" +
    "                                                <td md-cell ng-show=\"uploader.isHTML5\">\n" +
    "                                                    <div class=\"progress\" style=\"margin-bottom: 0;\">\n" +
    "                                                        <div class=\"progress-bar\" role=\"progressbar\" ng-style=\"{ 'width': item.progress + '%' }\"></div>\n" +
    "                                                    </div>\n" +
    "                                                </td>\n" +
    "                                                <td md-cell class=\"text-center\">\n" +
    "                                                    <span ng-show=\"item.isSuccess\"><i class=\"fa fa-check\" aria-hidden=\"true\"></i></span>\n" +
    "                                                    <span ng-show=\"item.isCancel\"><i class=\"fa fa-ban\" aria-hidden=\"true\"></i></span>\n" +
    "                                                    <span ng-show=\"item.isError\"><i class=\"fa fa-exclamation\" aria-hidden=\"true\"></i></span>\n" +
    "                                                </td>\n" +
    "                                                <td md-cell nowrap>\n" +
    "                                                    <md-button type=\"button\" aria-label=\"Delete\" class=\"md-raised\" ng-click=\"item.remove()\">\n" +
    "                                                        <i class=\"fa fa-trash\" aria-hidden=\"true\"></i>\n" +
    "                                                    </md-button>\n" +
    "                                                </td>\n" +
    "                                            </tr>\n" +
    "                                        </tbody>\n" +
    "                                    </table>\n" +
    "                                    <div>\n" +
    "                                        <div>\n" +
    "                                            <md-progress-linear md-mode=\"determinate\" value=\"{{uploader.progress}}\"></md-progress-linear>\n" +
    "                                        </div>\n" +
    "                                    </div>\n" +
    "                                </div>\n" +
    "                                <div ng-if=\"coupon.files.length\">\n" +
    "                                    <span>Files:</span>\n" +
    "                                    <div layout=\"row\">\n" +
    "                                        <md-card md-theme=\"default\" ng-repeat=\"file in coupon.files\" md-theme-watch>\n" +
    "                                            <a href=\"{{file.url}}\" target=\"_blank\">\n" +
    "                                                <img ng-if=\"file.extension != 'pdf' && file.extension != 'txt'\" layout-padding ng-src=\"{{file.url}}\" alt=\"Image\" style=\"height: 200px; width: 200px;\" />\n" +
    "                                                <div ng-if=\"file.extension == 'pdf' || file.extension == 'txt'\" layout-padding style=\"height: 200px; width: 200px;\" class=\"text-center\">\n" +
    "                                                    <i class=\"fa fa-file-text-o fa-5x\" aria-hidden=\"true\"></i>\n" +
    "                                                </div>\n" +
    "                                            </a>\n" +
    "                                            <md-card-actions layout=\"row\" layout-align=\"end center\">\n" +
    "                                                <md-button ng-click=\"removeFile(file)\">\n" +
    "                                                    <span ng-show=\"!file.loading\">Delete</span>\n" +
    "                                                    <span ng-show=\"file.loading\">Please wait...</span>\n" +
    "                                                </md-button>\n" +
    "                                            </md-card-actions>\n" +
    "                                        </md-card>\n" +
    "                                    </div>\n" +
    "                                </div>\n" +
    "                            </div>\n" +
    "                        </md-content>\n" +
    "                    </md-tab>\n" +
    "                </md-tabs>\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "        <md-dialog-actions layout=\"row\">\n" +
    "            <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button>\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading\">\n" +
    "                <span ng-show=\"!loading\">Save</span>\n" +
    "                <span ng-show=\"loading\"><i class=\"fa fa-cog fa-spin\"></i> Please wait...</span>\n" +
    "            </md-button>\n" +
    "        </md-dialog-actions>\n" +
    "    </form>\n" +
    "</md-dialog>\n" +
    "");
  $templateCache.put("/app/sections/merchant/coupon/pixieModals/detailsModal.html",
    "<md-dialog id=\"details-modal\" aria-label=\"Modal\" flex>\n" +
    "    <form name=\"form\">\n" +
    "        <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2 ng-bind=\"coupon.id ? 'Edit Coupon' : 'Add Coupon'\"></h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar>\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"md-dialog-content\">\n" +
    "                <md-tabs md-dynamic-height md-border-bottom md-stretch-tabs=\"always\">\n" +
    "                    <md-tab label=\"Details\">\n" +
    "                        <md-content class=\"md-padding\">\n" +
    "                            <div layout=\"column\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Title</label>\n" +
    "                                    <input ng-model=\"coupon.title\" required type=\"text\">\n" +
    "                                </md-input-container>\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Description</label>\n" +
    "                                    <textarea maxlength=\"200\" ng-model=\"coupon.description\" required rows=\"3\" md-select-on-focus></textarea>\n" +
    "                                    <em pull-right>{{coupon.description.length ? coupon.description.length : 0}}/200</em>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                            <div layout=\"row\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Start Date</label>\n" +
    "                                    <md-datepicker ng-model=\"coupon.start_date\"\n" +
    "                                                   md-placeholder=\"Start Date\"\n" +
    "                                                   md-open-on-focus></md-datepicker>\n" +
    "                                </md-input-container>\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>End Date</label>\n" +
    "                                    <md-datepicker ng-model=\"coupon.end_date\"\n" +
    "                                                   md-placeholder=\"End Date\"\n" +
    "                                                   md-open-on-focus></md-datepicker>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                        </md-content>\n" +
    "                    </md-tab>\n" +
    "                </md-tabs>\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "        <md-dialog-actions layout=\"row\">\n" +
    "            <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button>\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading\">\n" +
    "                <span ng-show=\"!loading\">Save</span>\n" +
    "                <span ng-show=\"loading\"><i class=\"fa fa-cog fa-spin\"></i> Please wait...</span>\n" +
    "            </md-button>\n" +
    "        </md-dialog-actions>\n" +
    "    </form>\n" +
    "</md-dialog>");
  $templateCache.put("/app/sections/merchant/coupon/pixieModals/modals/detailsModal.html",
    "<md-dialog aria-label=\"Modal\" flex>\n" +
    "    <form name=\"form\">\n" +
    "        <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2 ng-bind=\"coupon.id ? 'Edit Coupon' : 'Add Coupon'\"></h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar>\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"md-dialog-content\">\n" +
    "                <md-tabs md-dynamic-height md-border-bottom md-stretch-tabs=\"always\">\n" +
    "                    <md-tab label=\"Details\">\n" +
    "                        <md-content class=\"md-padding\">\n" +
    "                            <div layout=\"column\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Title</label>\n" +
    "                                    <input ng-model=\"coupon.title\" required type=\"text\">\n" +
    "                                </md-input-container>\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Description</label>\n" +
    "                                    <textarea maxlength=\"200\" ng-model=\"coupon.description\" required rows=\"3\" md-select-on-focus></textarea>\n" +
    "                                    <em pull-right>{{coupon.description.length ? coupon.description.length : 0}}/200</em>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                            <div layout=\"row\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Start Date</label>\n" +
    "                                    <md-datepicker ng-model=\"coupon.start_date\"\n" +
    "                                                   md-placeholder=\"Start Date\"\n" +
    "                                                   md-open-on-focus></md-datepicker>\n" +
    "                                </md-input-container>\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>End Date</label>\n" +
    "                                    <md-datepicker ng-model=\"coupon.end_date\"\n" +
    "                                                   md-placeholder=\"End Date\"\n" +
    "                                                   md-open-on-focus></md-datepicker>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                        </md-content>\n" +
    "                    </md-tab>\n" +
    "                </md-tabs>\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "        <md-dialog-actions layout=\"row\">\n" +
    "            <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button>\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading\">\n" +
    "                <span ng-show=\"!loading\">Save</span>\n" +
    "                <span ng-show=\"loading\"><i class=\"fa fa-cog fa-spin\"></i> Please wait...</span>\n" +
    "            </md-button>\n" +
    "        </md-dialog-actions>\n" +
    "    </form>\n" +
    "</md-dialog>");
  $templateCache.put("/app/sections/merchant/coupon/pixieModals/pixieModal.html",
    "<md-input-container>\n" +
    "    <md-button class=\"md-raised\" aria-label=\"back\" ng-click=\"goBack()\">\n" +
    "        <i class=\"fa fa-arrow-left\" aria-hidden=\"true\"></i>\n" +
    "    </md-button>\n" +
    "</md-input-container>\n" +
    "<!-- <md-dialog style=\"width: 100%; height: 100%; margin: auto\" aria-label=\"Modal\" flex> -->\n" +
    "<pixie-editor id=\"pixie-id\">\n" +
    "    <div class=\"global-spinner\">\n" +
    "        <style>\n" +
    "        .global-spinner {\n" +
    "            display: none;\n" +
    "            align-items: center;\n" +
    "            justify-content: center;\n" +
    "            z-index: 999;\n" +
    "            background: #fff;\n" +
    "            position: fixed;\n" +
    "            top: 0;\n" +
    "            left: 0;\n" +
    "            width: 100%;\n" +
    "            height: 100%;\n" +
    "        }\n" +
    "        </style>\n" +
    "        <style>\n" +
    "        .la-ball-spin-clockwise,\n" +
    "        .la-ball-spin-clockwise>div {\n" +
    "            position: relative;\n" +
    "            -webkit-box-sizing: border-box;\n" +
    "            -moz-box-sizing: border-box;\n" +
    "            box-sizing: border-box\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise {\n" +
    "            display: block;\n" +
    "            font-size: 0;\n" +
    "            color: #1976d2\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise.la-dark {\n" +
    "            color: #333\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise>div {\n" +
    "            display: inline-block;\n" +
    "            float: none;\n" +
    "            background-color: currentColor;\n" +
    "            border: 0 solid currentColor\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise {\n" +
    "            width: 32px;\n" +
    "            height: 32px\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise>div {\n" +
    "            position: absolute;\n" +
    "            top: 50%;\n" +
    "            left: 50%;\n" +
    "            width: 8px;\n" +
    "            height: 8px;\n" +
    "            margin-top: -4px;\n" +
    "            margin-left: -4px;\n" +
    "            border-radius: 100%;\n" +
    "            -webkit-animation: ball-spin-clockwise 1s infinite ease-in-out;\n" +
    "            -moz-animation: ball-spin-clockwise 1s infinite ease-in-out;\n" +
    "            -o-animation: ball-spin-clockwise 1s infinite ease-in-out;\n" +
    "            animation: ball-spin-clockwise 1s infinite ease-in-out\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise>div:nth-child(1) {\n" +
    "            top: 5%;\n" +
    "            left: 50%;\n" +
    "            -webkit-animation-delay: -.875s;\n" +
    "            -moz-animation-delay: -.875s;\n" +
    "            -o-animation-delay: -.875s;\n" +
    "            animation-delay: -.875s\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise>div:nth-child(2) {\n" +
    "            top: 18.1801948466%;\n" +
    "            left: 81.8198051534%;\n" +
    "            -webkit-animation-delay: -.75s;\n" +
    "            -moz-animation-delay: -.75s;\n" +
    "            -o-animation-delay: -.75s;\n" +
    "            animation-delay: -.75s\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise>div:nth-child(3) {\n" +
    "            top: 50%;\n" +
    "            left: 95%;\n" +
    "            -webkit-animation-delay: -.625s;\n" +
    "            -moz-animation-delay: -.625s;\n" +
    "            -o-animation-delay: -.625s;\n" +
    "            animation-delay: -.625s\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise>div:nth-child(4) {\n" +
    "            top: 81.8198051534%;\n" +
    "            left: 81.8198051534%;\n" +
    "            -webkit-animation-delay: -.5s;\n" +
    "            -moz-animation-delay: -.5s;\n" +
    "            -o-animation-delay: -.5s;\n" +
    "            animation-delay: -.5s\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise>div:nth-child(5) {\n" +
    "            top: 94.9999999966%;\n" +
    "            left: 50.0000000005%;\n" +
    "            -webkit-animation-delay: -.375s;\n" +
    "            -moz-animation-delay: -.375s;\n" +
    "            -o-animation-delay: -.375s;\n" +
    "            animation-delay: -.375s\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise>div:nth-child(6) {\n" +
    "            top: 81.8198046966%;\n" +
    "            left: 18.1801949248%;\n" +
    "            -webkit-animation-delay: -.25s;\n" +
    "            -moz-animation-delay: -.25s;\n" +
    "            -o-animation-delay: -.25s;\n" +
    "            animation-delay: -.25s\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise>div:nth-child(7) {\n" +
    "            top: 49.9999750815%;\n" +
    "            left: 5.0000051215%;\n" +
    "            -webkit-animation-delay: -.125s;\n" +
    "            -moz-animation-delay: -.125s;\n" +
    "            -o-animation-delay: -.125s;\n" +
    "            animation-delay: -.125s\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise>div:nth-child(8) {\n" +
    "            top: 18.179464974%;\n" +
    "            left: 18.1803700518%;\n" +
    "            -webkit-animation-delay: 0s;\n" +
    "            -moz-animation-delay: 0s;\n" +
    "            -o-animation-delay: 0s;\n" +
    "            animation-delay: 0s\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise.la-sm {\n" +
    "            width: 16px;\n" +
    "            height: 16px\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise.la-sm>div {\n" +
    "            width: 4px;\n" +
    "            height: 4px;\n" +
    "            margin-top: -2px;\n" +
    "            margin-left: -2px\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise.la-2x {\n" +
    "            width: 64px;\n" +
    "            height: 64px\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise.la-2x>div {\n" +
    "            width: 16px;\n" +
    "            height: 16px;\n" +
    "            margin-top: -8px;\n" +
    "            margin-left: -8px\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise.la-3x {\n" +
    "            width: 96px;\n" +
    "            height: 96px\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise.la-3x>div {\n" +
    "            width: 24px;\n" +
    "            height: 24px;\n" +
    "            margin-top: -12px;\n" +
    "            margin-left: -12px\n" +
    "        }\n" +
    "\n" +
    "        @-webkit-keyframes ball-spin-clockwise {\n" +
    "            0%,\n" +
    "            100% {\n" +
    "                opacity: 1;\n" +
    "                -webkit-transform: scale(1);\n" +
    "                transform: scale(1)\n" +
    "            }\n" +
    "            20% {\n" +
    "                opacity: 1\n" +
    "            }\n" +
    "            80% {\n" +
    "                opacity: 0;\n" +
    "                -webkit-transform: scale(0);\n" +
    "                transform: scale(0)\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        @-moz-keyframes ball-spin-clockwise {\n" +
    "            0%,\n" +
    "            100% {\n" +
    "                opacity: 1;\n" +
    "                -moz-transform: scale(1);\n" +
    "                transform: scale(1)\n" +
    "            }\n" +
    "            20% {\n" +
    "                opacity: 1\n" +
    "            }\n" +
    "            80% {\n" +
    "                opacity: 0;\n" +
    "                -moz-transform: scale(0);\n" +
    "                transform: scale(0)\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        @-o-keyframes ball-spin-clockwise {\n" +
    "            0%,\n" +
    "            100% {\n" +
    "                opacity: 1;\n" +
    "                -o-transform: scale(1);\n" +
    "                transform: scale(1)\n" +
    "            }\n" +
    "            20% {\n" +
    "                opacity: 1\n" +
    "            }\n" +
    "            80% {\n" +
    "                opacity: 0;\n" +
    "                -o-transform: scale(0);\n" +
    "                transform: scale(0)\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        @keyframes ball-spin-clockwise {\n" +
    "            0%,\n" +
    "            100% {\n" +
    "                opacity: 1;\n" +
    "                -webkit-transform: scale(1);\n" +
    "                -moz-transform: scale(1);\n" +
    "                -o-transform: scale(1);\n" +
    "                transform: scale(1)\n" +
    "            }\n" +
    "            20% {\n" +
    "                opacity: 1\n" +
    "            }\n" +
    "            80% {\n" +
    "                opacity: 0;\n" +
    "                -webkit-transform: scale(0);\n" +
    "                -moz-transform: scale(0);\n" +
    "                -o-transform: scale(0);\n" +
    "                transform: scale(0)\n" +
    "            }\n" +
    "        }\n" +
    "        </style>\n" +
    "        <div class=\"la-ball-spin-clockwise la-2x\">\n" +
    "            <div></div>\n" +
    "            <div></div>\n" +
    "            <div></div>\n" +
    "            <div></div>\n" +
    "            <div></div>\n" +
    "            <div></div>\n" +
    "            <div></div>\n" +
    "            <div></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <script>\n" +
    "    setTimeout(function() {\n" +
    "        var spinner = document.querySelector('.global-spinner');\n" +
    "        if (spinner) spinner.style.display = 'flex';\n" +
    "    }, 50);\n" +
    "    </script>\n" +
    "</pixie-editor>\n" +
    "<!-- </md-dialog> -->");
  $templateCache.put("/app/sections/merchant/merchant.html",
    "<div>\n" +
    "    <div layout=\"column\">\n" +
    "        <span class=\"table-title padding-bottom\">\n" +
    "            <!-- <i class=\"fa fa-database\" aria-hidden=\"true\"></i> -->\n" +
    "             Merchants in DB</span>\n" +
    "        <form novalidate flex layout=\"row\" ng-submit=\"search()\">\n" +
    "            <md-input-container class=\"filter-by-container-fix\">\n" +
    "                <label>Categories</label>\n" +
    "                <md-select ng-change=\"selectFilter()\" ng-model=\"filters\" multiple>\n" +
    "                    <md-option ng-repeat=\"category in categories\" value=\"{{category.id}}\">{{category.name}}</md-option>\n" +
    "                </md-select>\n" +
    "                <em ng-if=\"categoryLoading\">Please wait...</em>\n" +
    "            </md-input-container>\n" +
    "            <md-input-container flex>\n" +
    "                <label>Search</label>\n" +
    "                <input type=\"text\" autocomplete=\"off\" ng-disabled=\"!total && !params.search\" ng-model=\"params.search\" ng-change=\"search()\">\n" +
    "            </md-input-container>\n" +
    "           <!--  <md-button class=\"md-fab md-mini\" type=\"submit\" ng-disabled=\"!total && !params.search\" aria-label=\"Search\">\n" +
    "                <i class=\"fa fa-search\"></i>\n" +
    "            </md-button> -->\n" +
    "            <md-input-container class=\"no\">\n" +
    "                <md-button class=\"md-raised md-primary\" type=\"button\" ng-click=\"openMerchantAdd()\" aria-label=\"Add\">\n" +
    "                    <span class=\"icon-lic-add btn-icon\"></span>Add New Merchant\n" +
    "                </md-button>\n" +
    "            </md-input-container>\n" +
    "        </form>\n" +
    "    </div>\n" +
    "    <md-table-container ng-if=\"total > 0 && !loading\">\n" +
    "        <table md-table>\n" +
    "            <thead md-head md-order=\"params.sort_by\" md-on-reorder=\"sortMerchants\">\n" +
    "                <tr md-row>\n" +
    "                    <th md-column md-order-by=\"id\">\n" +
    "                        <span>No.</span>\n" +
    "                        <i class=\"fa fa-sort\" aria-hidden=\"true\">\n" +
    "                            <md-tooltip md-direction=\"bottom\">Sort by Number</md-tooltip>\n" +
    "                        </i>\n" +
    "                    </th>\n" +
    "                    <th md-column md-order-by=\"name\">\n" +
    "                        <span>Name</span>\n" +
    "                        <i class=\"fa fa-sort\" aria-hidden=\"true\">\n" +
    "                            <md-tooltip md-direction=\"bottom\">Sort by Name</md-tooltip>\n" +
    "                         </i>\n" +
    "                    </th>\n" +
    "                    <th md-column>Stores</th>\n" +
    "                    <th md-column>Coupons</th>\n" +
    "                    <th md-column md-order-by=\"shopping_center_name\">\n" +
    "                        <span>Shopping Center</span>\n" +
    "                        <i class=\"fa fa-sort\" aria-hidden=\"true\">\n" +
    "                            <md-tooltip md-direction=\"bottom\">Sort by Shopping center name</md-tooltip>\n" +
    "                        </i>\n" +
    "                    </th>\n" +
    "                    <th md-column>Category</th>\n" +
    "                    <th md-column></th>\n" +
    "                </tr>\n" +
    "            </thead>\n" +
    "            <tbody md-body>\n" +
    "                <tr md-row ng-repeat=\"merchant in merchants track by $index\">\n" +
    "                    <td md-cell ng-bind=\"merchant.id\"></td>\n" +
    "                    <td md-cell ng-bind=\"merchant.name\"></td>\n" +
    "                    <td md-cell ng-bind=\"merchant.stores\"></td>\n" +
    "                    <td md-cell ng-bind=\"merchant.coupons\"></td>\n" +
    "                    <td md-cell ng-bind=\"merchant.shopping_center_name ? merchant.shopping_center_name : '-'\"></td>\n" +
    "                    <td md-cell><span ng-repeat=\"categories in merchant.categories\">{{categories.name}} </span></td>\n" +
    "                    <td md-cell text-right>\n" +
    "                        <md-button aria-label=\"Coupons\" class=\"md-primary md-icon-button td-btn-coupon\" ui-sref=\"layout.coupons({merchantId: merchant.id})\">\n" +
    "                            <span class=\"icon-lic-coupon\" aria-hidden=\"true\"></span>\n" +
    "                            <md-tooltip md-direction=\"bottom\">Coupons</md-tooltip>\n" +
    "                        </md-button>\n" +
    "                        <md-button aria-label=\"Edit\" class=\"md-accent md-hue-1 md-icon-button td-btn-edit\" ng-click=\"openMerchantEdit(merchant)\">\n" +
    "                            <span class=\"icon-lic-edit\" aria-hidden=\"true\"></span>\n" +
    "                            <md-tooltip md-direction=\"bottom\">Edit</md-tooltip>\n" +
    "                        </md-button>\n" +
    "                        <md-button aria-label=\"Remove\" class=\"md-icon-button md-warn td-btn-delete\" ng-click=\"removeModal($event, merchant)\">\n" +
    "                            <span class=\"icon-lic-delete\" aria-hidden=\"true\"></span>\n" +
    "                            <md-tooltip md-direction=\"bottom\">Delete</md-tooltip>\n" +
    "                        </md-button>\n" +
    "                       <!--  <md-button aria-label=\"Notification\" class=\"md-raised md-accent md-hue-1\" ng-click=\"sendNotification($event, merchant)\">\n" +
    "                            <i class=\"fa fa-bell-o\" aria-hidden=\"true\"></i>\n" +
    "                            <md-tooltip md-direction=\"bottom\">Notification</md-tooltip>\n" +
    "                        </md-button> -->\n" +
    "                    </td>\n" +
    "                </tr>\n" +
    "            </tbody>\n" +
    "        </table>\n" +
    "    </md-table-container>\n" +
    "    <h4 ng-show=\"!loading && !total && !params.search\" class=\"text-center\">Currently there are no merchants in your database.</h4>\n" +
    "    <h4 ng-show=\"params.search && total == 0\" class=\"text-center\">Currently there are no results that match search criterium.</h4>\n" +
    "    <h4 ng-show=\"loading\" class=\"text-center\">Please wait...</h4>\n" +
    "    <md-table-pagination ng-if=\"total > 0 && !loading\" md-options=\"[10, 20, 30]\" md-limit=\"params.limit\" md-page=\"params.page\"\n" +
    "        md-total=\"{{total}}\" md-on-paginate=\"onPaginate\" md-page-select></md-table-pagination>\n" +
    "</div>");
  $templateCache.put("/app/sections/merchant/modals/merchantModal.html",
    "<md-dialog aria-label=\"Modal\" flex>\n" +
    "    <form name=\"form\">\n" +
    "        <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2 ng-bind=\"merchant.id ? 'Edit Merchant' : 'Add Merchant'\"></h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar>\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"md-dialog-content\">\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Name</label>\n" +
    "                        <input name=\"name\" ng-model=\"merchant.name\" required type=\"text\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.name.$error.required\">Enter merchant name</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Description</label>\n" +
    "                        <textarea name=\"description\" minlength=\"3\" required ng-model=\"merchant.description\" rows=\"5\" md-select-on-focus></textarea>\n" +
    "                        <em class=\"error-message\" ng-show=\"form.description.$error.required\">Please enter description</em>\n" +
    "                        <em class=\"error-message\" ng-show=\"form.description.$error.minlength\">Description must be at least 3 characters long</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <div flex>\n" +
    "                        <md-autocomplete md-input-name=\"area\" md-selected-item=\"selectedArea\" md-search-text=\"searchAreaText\" md-selected-item-change=\"selectArea(area)\" required md-items=\"area in loadArea(searchAreaText)\" md-item-text=\"area.name\" md-require-match md-delay=\"300\" md-min-length=\"0\" md-floating-label=\"Area\">\n" +
    "                            <md-item-template>\n" +
    "                                <span md-highlight-text=\"searchAreaText\">{{area.name}}</span>\n" +
    "                            </md-item-template>\n" +
    "                            <md-not-found>\n" +
    "                                No states matching \"{{searchAreaText}}\" were found.\n" +
    "                            </md-not-found>\n" +
    "                            <em class=\"error-message\" ng-show=\"form.area.$error.required\">Please select area</em>\n" +
    "                        </md-autocomplete>\n" +
    "                    </div>\n" +
    "                    <div flex>\n" +
    "                        <md-autocomplete md-selected-item=\"selectedShoppingCenter\" md-no-cache=\"true\" md-search-text=\"searchTextShoppingCenter\" md-selected-item-change=\"selectShoppingCenter(shoppingCenter)\" md-items=\"shoppingCenter in loadShoppingCenters(searchTextShoppingCenter)\" md-item-text=\"shoppingCenter.name\" md-require-match md-delay=\"300\" md-min-length=\"0\" md-floating-label=\"Shopping Center\">\n" +
    "                            <md-item-template>\n" +
    "                                <span md-highlight-text=\"searchTextShoppingCenter\">{{shoppingCenter.name}}</span>\n" +
    "                            </md-item-template>\n" +
    "                            <md-not-found>\n" +
    "                                No states matching \"{{searchTextShoppingCenter}}\" were found.\n" +
    "                            </md-not-found>\n" +
    "                        </md-autocomplete>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex ng-if=\"!merchant.shopping_center_id\">\n" +
    "                        <label>Shopping Center Name</label>\n" +
    "                        <input name=\"shopping_center_name\" ng-model=\"merchant.shopping_center_name\" ng-required=\"!merchant.shopping_center_id || !shoppingCenter.lat || !shoppingCenter.lon\" type=\"text\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.shopping_center_name.$error.required\">Required if shopping center is not selected</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Zip</label>\n" +
    "                        <input ng-model=\"merchant.zip\" name=\"zip\" ng-change=\"geoLocationByZip(merchant.zip)\" ng-required=\"!merchant.shopping_center_id\" type=\"text\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.zip.$error.required\">Please enter ZIP code</em>\n" +
    "                    </md-input-container>\n" +
    "                    <div layout=\"row\">\n" +
    "                        <md-input-container flex>\n" +
    "                            <label>Address</label>\n" +
    "                            <input name=\"address\" ng-model=\"merchant.address\" ng-required=\"!merchant.shopping_center_id\" ng-disabled=\"loadingByZip\" type=\"text\">\n" +
    "                            <em class=\"error-message\" ng-show=\"form.address.$error.required\">Please enter address</em>\n" +
    "                        </md-input-container>\n" +
    "                        <md-input-container flex>\n" +
    "                            <label>Suite number</label>\n" +
    "                            <input name=\"suite_number\" ng-model=\"merchant.suite_number\" ng-required=\"!merchant.address\" ng-disabled=\"loadingByZip\" type=\"text\">\n" +
    "                            <em class=\"error-message\" ng-show=\"form.suite_number.$error.required\">Please enter suite number</em>\n" +
    "                        </md-input-container>\n" +
    "                    </div>\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>City</label>\n" +
    "                        <input ng-model=\"merchant.city\" name=\"city\" ng-required=\"!merchant.shopping_center_id\" ng-disabled=\"loadingByZip\" required type=\"text\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.city.$error.required\">Please enter city name</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Latitude</label>\n" +
    "                        <input name=\"lat\" ng-model=\"merchant.lat\" required ng-disabled=\"loadingByZip\" type=\"number\" step=\"any\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.lat.$error.required\">Please enter latitude</em>\n" +
    "                    </md-input-container>\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Longitude</label>\n" +
    "                        <input name=\"lon\" ng-model=\"merchant.lon\" required ng-disabled=\"loadingByZip\" type=\"number\" step=\"any\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.lon.$error.required\">Please enter Longitude</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Phone</label>\n" +
    "                        <input ng-model=\"merchant.phone\" type=\"text\">\n" +
    "                    </md-input-container>\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Website</label>\n" +
    "                        <input ng-model=\"merchant.website\" type=\"text\">\n" +
    "                        <em>* http://www.example.com</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"column\">\n" +
    "                    <md-input-container flex md-no-float>\n" +
    "                        <label></label>\n" +
    "                        <tags-input ng-model=\"merchant.categories\" replaces-spaces-with-dashes=\"false\" aria-label=\"Category\" placeholder=\"Add Category\" debounce-delay=\"100\" key-property=\"id\" display-property=\"name\" add-from-autocomplete-only=\"true\" max-results-to-show=\"10\">\n" +
    "                            <auto-complete source=\"loadCategories($query)\" aria-label=\"Category\" load-on-focus=\"true\" load-on-empty=\"true\" min-length=\"0\" debounce-delay=\"100\"></auto-complete>\n" +
    "                        </tags-input>\n" +
    "                        <em ng-if=\"categoryLoading\">Please wait...</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"column\">\n" +
    "                    <h4>Merchant Logo</h4>\n" +
    "                    <div ng-if=\"imagePreparedForUpload\" file=\"imagePreparedForUpload._file\" width=\"140\" height=\"140\" ng-thumb></div>\n" +
    "                    <div class=\"merchant-logo-container\" ng-if=\"merchant.logo && !imagePreparedForUpload\">\n" +
    "                        <a href=\"#\" ng-click=\"removeLogo()\"><i class=\"fa fa-minus-circle\" aria-hidden=\"true\"></i></a>\n" +
    "                        <img width=\"140\" height=\"140\" ng-src=\"{{merchant.logo}}\">\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <input type=\"file\" nv-file-select=\"\" uploader=\"uploader\" />\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "        <md-dialog-actions layout=\"row\">\n" +
    "            <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button>\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading\">\n" +
    "                <span ng-show=\"!loading\">Save</span>\n" +
    "                <span ng-show=\"loading\">Please wait...</span>\n" +
    "            </md-button>\n" +
    "        </md-dialog-actions>\n" +
    "    </form>\n" +
    "</md-dialog>");
  $templateCache.put("/app/sections/merchant/modals/notificationModal/merchantNotificationModal.html",
    "<md-dialog aria-label=\"Modal\" flex>\n" +
    "    <md-toolbar>\n" +
    "        <div class=\"md-toolbar-tools\">\n" +
    "            <span class=\"padding-bottom-0\"><i class=\"fa fa-bell\" aria-hidden=\"true\"></i> {{merchant.name}}</span>\n" +
    "            <span flex></span>\n" +
    "            <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "            </md-button>\n" +
    "        </div>\n" +
    "    </md-toolbar>\n" +
    "    <form novalidate flex layout=\"column\" ng-submit=\"send()\">\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"md-dialog-content\">\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Title</label>\n" +
    "                        <input ng-model=\"notification.title\" required type=\"text\">\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Description</label>\n" +
    "                        <textarea maxlength=\"200\" ng-model=\"notification.description\" required rows=\"3\" md-select-on-focus></textarea>\n" +
    "                        <em pull-right>{{notification.description.length ? notification.description.length : 0}}/200</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <md-dialog-actions layout=\"row\">\n" +
    "                    <md-button type=\"submit\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading\">\n" +
    "                        <span ng-show=\"!loading\">Send</span>\n" +
    "                        <span ng-show=\"loading\"><i class=\"fa fa-cog fa-spin\"></i> Please wait...</span>\n" +
    "                    </md-button>\n" +
    "                </md-dialog-actions>\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "    </form>\n" +
    "</md-dialog>");
  $templateCache.put("/app/sections/merchantRequest/merchantRequest.html",
    "<div>\n" +
    "    <div layout=\"column\">\n" +
    "        <span class=\"padding-bottom-0\"><i class=\"fa fa-database\" aria-hidden=\"true\"></i> Requests for Merchants to approve</span>\n" +
    "        <h4 ng-show=\"loading\" class=\"text-center\">Please wait...</h4>\n" +
    "        <md-table-container ng-if=\"total > 0\">\n" +
    "            <table md-table md-progress=\"promise\">\n" +
    "                <thead md-head>\n" +
    "                    <tr md-row>\n" +
    "                        <th md-column>Name</th>\n" +
    "                    </tr>\n" +
    "                </thead>\n" +
    "                <tbody md-body>\n" +
    "                    <tr md-row ng-repeat=\"merchant in merchants track by $index\">\n" +
    "                        <td md-cell ng-bind=\"merchant.name\"></td>\n" +
    "                        <td md-cell text-right>\n" +
    "                            <md-button class=\"md-raised\" ng-click=\"previewMerchantModal($event, merchant)\">Preview</md-button>\n" +
    "                        </td>\n" +
    "                    </tr>\n" +
    "                </tbody>\n" +
    "            </table>\n" +
    "        </md-table-container>\n" +
    "        <h4 ng-show=\"!loading && !total && !params.search\" class=\"text-center\">Currently there are no merchants waiting for approval.</h4>\n" +
    "        <md-table-pagination ng-if=\"total > 0\"\n" +
    "                             md-options=\"[10, 20, 30]\"\n" +
    "                             md-limit=\"params.limit\"\n" +
    "                             md-page=\"params.page\"\n" +
    "                             md-total=\"{{total}}\"\n" +
    "                             md-on-paginate=\"onPaginate\"\n" +
    "                             md-page-select></md-table-pagination>\n" +
    "    </div>\n" +
    "</div>");
  $templateCache.put("/app/sections/merchantRequest/modals/merchantRequestModal.html",
    "<md-dialog aria-label=\"Modal\" flex>\n" +
    "    <form name=\"form\">\n" +
    "        <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2>Merchant request review</h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar>\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"md-dialog-content\">\n" +
    "                <table class=\"table\">\n" +
    "                    <tr>\n" +
    "                        <td>Name</td>\n" +
    "                        <td ng-bind=\"merchant.name\"></td>\n" +
    "                    </tr>\n" +
    "                    <tr>\n" +
    "                        <td>Area</td>\n" +
    "                        <td ng-bind=\"merchant.areaName ? merchant.areaName : '-'\"></td>\n" +
    "                    </tr>\n" +
    "                    <tr>\n" +
    "                        <td>Address</td>\n" +
    "                        <td ng-bind=\"merchant.address\"></td>\n" +
    "                    </tr>\n" +
    "                    <tr>\n" +
    "                        <td>City</td>\n" +
    "                        <td ng-bind=\"merchant.city\"></td>\n" +
    "                    </tr>\n" +
    "                    <tr>\n" +
    "                        <td>Zip</td>\n" +
    "                        <td ng-bind=\"merchant.zip\"></td>\n" +
    "                    </tr>\n" +
    "                    <tr>\n" +
    "                        <td>Phone</td>\n" +
    "                        <td ng-bind=\"merchant.phone\"></td>\n" +
    "                    </tr>\n" +
    "                    <tr>\n" +
    "                        <td>Website</td>\n" +
    "                        <td ng-bind=\"merchant.website\"></td>\n" +
    "                    </tr>\n" +
    "                </table>\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "        <md-dialog-actions layout=\"row\">\n" +
    "            <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button>\n" +
    "            <md-button type=\"submit\" ng-click=\"approve()\" class=\"md-raised md-primary\" ng-disabled=\"loadingApprove || loadingReject\">\n" +
    "                <span ng-show=\"!loadingApprove\">Approve</span>\n" +
    "                <span ng-show=\"loadingApprove\">Please wait...</span>\n" +
    "            </md-button>\n" +
    "            <md-button type=\"submit\" ng-click=\"reject()\" class=\"md-raised md-warn\" ng-disabled=\"loadingReject || loadingApprove\">\n" +
    "                <span ng-show=\"!loadingReject\">Reject</span>\n" +
    "                <span ng-show=\"loadingReject\">Please wait...</span>\n" +
    "            </md-button>\n" +
    "        </md-dialog-actions>\n" +
    "    </form>\n" +
    "</md-dialog>\n" +
    "");
  $templateCache.put("/app/sections/pushNotifications/pushNotification.html",
    "<div layout=\"column\">\n" +
    "    <span class=\"padding-bottom table-title\">\n" +
    "    <!-- <i class=\"fa fa-bell\" aria-hidden=\"true\"></i> -->\n" +
    "    Push notifications</span>\n" +
    "    <form name=\"form\" novalidate flex layout=\"column\" ng-submit=\"send()\">\n" +
    "        <div layout=\"column\">\n" +
    "            <div layout=\"row\" ng-if=\"session.role == 'admin' || session.role == 'sc-user'\">\n" +
    "                        <md-input-container>\n" +
    "                            <label>User type</label>\n" +
    "                            <md-select ng-model=\"user.type\" ng-change=\"roleChanged()\">\n" +
    "                                <md-option ng-if=\"userRole.id\" ng-repeat=\"userRole in userRoles\" ng-value=\"userRole.id\">\n" +
    "                                    {{userRole.name}}\n" +
    "                                </md-option>\n" +
    "                            </md-select>\n" +
    "                        </md-input-container>\n" +
    "                    <div flex ng-if=\"user.type == 1 && !user.id\">\n" +
    "                        <md-autocomplete required md-input-name=\"merchant\" md-selected-item=\"selectedMerchant\" md-search-text=\"data.searchMerchantText\" md-selected-item-change=\"selectMerchant(merchant)\"\n" +
    "                                         md-items=\"merchant in loadMerchants(data.searchMerchantText)\" md-item-text=\"merchant.name\" md-require-match md-delay=\"300\"\n" +
    "                                         md-min-length=\"0\" md-floating-label=\"Merchant\">\n" +
    "                            <md-item-template>\n" +
    "                                <span md-highlight-text=\"data.searchMerchantText\">{{merchant.name}}</span>\n" +
    "                            </md-item-template>\n" +
    "                            <md-not-found>\n" +
    "                                No matching \"{{data.searchMerchantText}}\" merchants were found.\n" +
    "                            </md-not-found>\n" +
    "                        </md-autocomplete>\n" +
    "                    </div>\n" +
    "                    <div flex ng-if=\"user.type == 2 && !user.id\">\n" +
    "                        <md-autocomplete required md-input-name=\"shippingCenter\" md-selected-item=\"selectedShoppingCenter\" md-search-text=\"data.searchShoppingCenterText\" md-selected-item-change=\"selectShoppingCenter(shoppingCenter)\"\n" +
    "                                         md-items=\"shoppingCenter in loadShoppingCenters(data.searchShoppingCenterText)\" md-item-text=\"shoppingCenter.name\" md-require-match md-delay=\"300\"\n" +
    "                                         md-min-length=\"0\" md-floating-label=\"Shopping Center\">\n" +
    "                            <md-item-template>\n" +
    "                                <span md-highlight-text=\"data.searchShoppingCenterText\">{{shoppingCenter.name}}</span>\n" +
    "                            </md-item-template>\n" +
    "                            <md-not-found>\n" +
    "                                No matching \"{{data.searchShoppingCenterText}}\" shopping centers were found.\n" +
    "                            </md-not-found>\n" +
    "                        </md-autocomplete>\n" +
    "                    </div>\n" +
    "            </div>\n" +
    "            <md-input-container flex>\n" +
    "                <label>Title</label>\n" +
    "                <input ng-model=\"notification.title\" required type=\"text\">\n" +
    "            </md-input-container>\n" +
    "            <md-input-container flex>\n" +
    "                <label>Description</label>\n" +
    "                <textarea maxlength=\"200\" ng-model=\"notification.description\" required rows=\"2\" md-select-on-focus></textarea>\n" +
    "                <em pull-right>{{notification.description.length ? notification.description.length : 0}}/200</em>\n" +
    "            </md-input-container>\n" +
    "            <section layout=\"row\">\n" +
    "                <md-button type=\"submit\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading\">\n" +
    "                    <span ng-show=\"!loading\"><span class=\"icon-lic-send-notification btn-icon\"></span>Send</span>\n" +
    "                    <span ng-show=\"loading\"><i class=\"fa fa-cog fa-spin\"></i> Please wait...</span>\n" +
    "                </md-button>\n" +
    "            </section>\n" +
    "        </div>\n" +
    "    </form>\n" +
    "</div>");
  $templateCache.put("/app/sections/register/register.html",
    "<md-content flex layout=\"row\" layout-align=\"center center\">\n" +
    "		<div flex-sm=\"80\" flex-gt-sm=\"60\" layout=\"column\" class=\"register-container\">\n" +
    "				<md-whiteframe class=\"md-whiteframe-1dp\">\n" +
    "						<md-content class=\"md-padding\">\n" +
    "								<div flex layout=\"column\" layout-align=\"center center\" md-accent-color>\n" +
    "										<img class=\"outterpage-logo\" src=\"assets/images/logo-new.png\"/>\n" +
    "										<div layout=\"row\">\n" +
    "												<md-input-container class=\"no-mrg\">\n" +
    "														<md-button class=\"md-fab md-primary\" ng-class=\"{'active-step': step == 1}\" aria-label=\"Use Android\">\n" +
    "																1\n" +
    "														</md-button>\n" +
    "												</md-input-container>\n" +
    "												<md-input-container layout=\"row\" class=\"no-mrg\" layout-align=\"center center\">\n" +
    "														-\n" +
    "												</md-input-container>\n" +
    "												<md-input-container class=\"no-mrg\">\n" +
    "														<md-button class=\"md-fab md-primary\" ng-click=\"selectStep(2)\" ng-class=\"{'active-step': step == 2}\" ng-disabled=\"step < 2\" aria-label=\"Use Android\">\n" +
    "																2\n" +
    "														</md-button>\n" +
    "												</md-input-container>\n" +
    "												<md-input-container layout=\"row\" class=\"no-mrg\" layout-align=\"center center\">\n" +
    "														-\n" +
    "												</md-input-container>\n" +
    "												<md-input-container class=\"no-mrg\">\n" +
    "														<md-button class=\"md-fab md-primary\" ng-click=\"selectStep(3)\" ng-class=\"{'active-step': step == 3}\" ng-disabled=\"step < 3\" aria-label=\"Use Android\">\n" +
    "																3\n" +
    "														</md-button>\n" +
    "												</md-input-container>\n" +
    "										</div>\n" +
    "								</div>\n" +
    "								<div ng-form=\"formStepOne\" ng-if=\"step == 1\" layout=\"column\">\n" +
    "										<div layout=\"row\">\n" +
    "												<md-input-container flex>\n" +
    "														<label>User Type</label>\n" +
    "														<md-select ng-model=\"data.selectedUserType\" required ng-change=\"changeUserType()\" placeholder=\"Select user type\">\n" +
    "																<md-option ng-value=\"type\" ng-repeat=\"type in userTypes\">{{ type.name }}</md-option>\n" +
    "														</md-select>\n" +
    "												</md-input-container>\n" +
    "										</div>\n" +
    "										<div layout=\"row\" flex>\n" +
    "												<md-input-container flex>\n" +
    "														<label>First name</label>\n" +
    "														<input type=\"text\" ng-model=\"user.first_name\" required>\n" +
    "												</md-input-container>\n" +
    "												<md-input-container flex>\n" +
    "														<label>Last name</label>\n" +
    "														<input type=\"text\" ng-model=\"user.last_name\" required>\n" +
    "												</md-input-container>\n" +
    "										</div>\n" +
    "										<md-input-container flex>\n" +
    "												<label>Email</label>\n" +
    "												<input type=\"text\"\n" +
    "															 ng-model=\"user.email\"\n" +
    "															 required\n" +
    "															 ng-blur=\"checkEmail(user.email)\"\n" +
    "															 ng-pattern=\"/^[_a-z0-9]+(\\.[_a-z0-9]+)*@[a-z0-9-]+(\\.[a-z0-9-]+)*(\\.[a-z]{2,4})$/\">\n" +
    "										</md-input-container>\n" +
    "										<md-input-container flex>\n" +
    "												<label>Password</label>\n" +
    "												<input type=\"password\" ng-minlength=\"6\" ng-model=\"user.password\" required>\n" +
    "												<em>* minimum 6 characters long</em>\n" +
    "										</md-input-container>\n" +
    "										<md-input-container flex>\n" +
    "												<label>Repeat Password</label>\n" +
    "												<input type=\"password\" ng-minlength=\"6\" ng-model=\"user.password_confirmation\" required>\n" +
    "										</md-input-container>\n" +
    "										<md-button class=\"md-raised md-primary\" type=\"submit\" pull-right ng-click=\"registerUser()\" ng-disabled=\"formStepOne.$invalid || user.password != user.password_confirmation || loading\">\n" +
    "												<span ng-show=\"!loading\">Next</span>\n" +
    "												<span ng-show=\"loading\"><i class=\"fa fa-cog fa-spin\"></i> Please wait...</span>\n" +
    "										</md-button>\n" +
    "								</div>\n" +
    "								<div ng-form=\"formStepTwo\" ng-if=\"step == 2\" layout=\"column\" flex>\n" +
    "										<div layout=\"column\" ng-if=\"data.selectedUserType.id == 1\">\n" +
    "												<md-input-container flex>\n" +
    "														<label>Merchant's Name</label>\n" +
    "														<input type=\"text\" ng-model=\"userType.name\" required>\n" +
    "												</md-input-container>\n" +
    "												<div layout=\"row\">\n" +
    "														<div flex>\n" +
    "																<md-autocomplete md-selected-item=\"data.selectedArea\"\n" +
    "																								 md-search-text=\"data.searchAreaText\"\n" +
    "																								 md-selected-item-change=\"selectArea(area)\"\n" +
    "																								 md-items=\"area in loadArea(data.searchAreaText)\"\n" +
    "																								 md-item-text=\"area.name\"\n" +
    "																								 required\n" +
    "																								 md-delay=\"300\"\n" +
    "																								 md-min-length=\"0\"\n" +
    "																								 md-require-match\n" +
    "																								 md-floating-label=\"Area\">\n" +
    "																		<md-item-template>\n" +
    "																				<span md-highlight-text=\"data.searchAreaText\">{{area.name}}</span>\n" +
    "																		</md-item-template>\n" +
    "																		<md-not-found>\n" +
    "																				No matching \"{{data.searchAreaText}}\" areas were found.\n" +
    "																		</md-not-found>\n" +
    "																</md-autocomplete>\n" +
    "														</div>\n" +
    "														<div flex layout=\"row\">\n" +
    "																<md-autocomplete flex md-selected-item=\"data.selectedShoppingCenter\"\n" +
    "																								 md-no-cache=\"true\"\n" +
    "																								 md-search-text=\"data.searchTextShoppingCenter\"\n" +
    "																								 md-selected-item-change=\"selectShoppingCenter(shoppingCenter)\"\n" +
    "																								 md-items=\"shoppingCenter in loadShoppingCenters(data.searchTextShoppingCenter)\"\n" +
    "																								 md-item-text=\"shoppingCenter.name\"\n" +
    "																								 md-require-match\n" +
    "																								 md-delay=\"300\"\n" +
    "																								 md-min-length=\"0\"\n" +
    "																								 md-floating-label=\"Shopping Center\">\n" +
    "																		<md-item-template>\n" +
    "																				<span md-highlight-text=\"data.searchTextShoppingCenter\">{{shoppingCenter.name}}</span>\n" +
    "																		</md-item-template>\n" +
    "																		<md-not-found>\n" +
    "																				No matching \"{{data.searchTextShoppingCenter}}\" shopping center were found.\n" +
    "																		</md-not-found>\n" +
    "																</md-autocomplete>\n" +
    "														</div>\n" +
    "														<md-input-container flex ng-if=\"!userType.shopping_center_id\">\n" +
    "																<label>Shopping Center Name</label>\n" +
    "																<input type=\"text\" ng-model=\"userType.shopping_center_name\" ng-required=\"!userType.shopping_center_id\">\n" +
    "														</md-input-container>\n" +
    "													</div>\n" +
    "												<div layout=\"row\">\n" +
    "														<md-input-container flex>\n" +
    "																<label>ZIP</label>\n" +
    "																<input type=\"text\" ng-change=\"geoLocationByZip(userType.zip)\" ng-model=\"userType.zip\" ng-required=\"!userType.shopping_center_id\">\n" +
    "														</md-input-container>\n" +
    "														<md-input-container flex>\n" +
    "																<label>City Name</label>\n" +
    "																<input type=\"text\" ng-model=\"userType.city\" ng-disabled=\"loadingByZip\" ng-required=\"!userType.shopping_center_id\">\n" +
    "														</md-input-container>\n" +
    "														<md-input-container flex>\n" +
    "																<label>Address</label>\n" +
    "																<input type=\"text\" ng-model=\"userType.address\" ng-disabled=\"loadingByZip\" ng-required=\"!userType.shopping_center_id\">\n" +
    "														</md-input-container>\n" +
    "												</div>\n" +
    "												<div layout=\"row\">\n" +
    "														<md-input-container flex>\n" +
    "																<label>Phone</label>\n" +
    "																<input type=\"text\" ng-minlength=\"6\" ng-model=\"userType.phone\"/>\n" +
    "														</md-input-container>\n" +
    "														<md-input-container flex>\n" +
    "																<label>Website</label>\n" +
    "																<input type=\"text\" placeholder=\"http://www.example.com\" ng-model=\"userType.website\"/>\n" +
    "														</md-input-container>\n" +
    "												</div>\n" +
    "												<div layout=\"row\">\n" +
    "														<md-input-container flex>\n" +
    "																<label>Categories</label>\n" +
    "																<tags-input ng-model=\"userType.categories\"\n" +
    "																						key-property=\"id\"\n" +
    "																						placeholder=\"Add Category\"\n" +
    "																						display-property=\"name\"\n" +
    "																						add-from-autocomplete-only=\"true\"\n" +
    "																						replace-spaces-with-dashes=\"false\"\n" +
    "																						max-results-to-show=\"10\">\n" +
    "																		<auto-complete debounce-delay=\"100\"\n" +
    "																									 source=\"loadCategories($query)\"\n" +
    "																									 load-on-empty=\"true\"\n" +
    "																									 min-length=\"0\"\n" +
    "																									 load-on-focus=\"true\">\n" +
    "																		</auto-complete>\n" +
    "																</tags-input>\n" +
    "														</md-input-container>\n" +
    "												</div>\n" +
    "										</div>\n" +
    "										<div layout=\"column\" ng-if=\"data.selectedUserType.id == 2\">\n" +
    "												<div layout=\"row\">\n" +
    "														<md-input-container flex>\n" +
    "																<label>Shopping Center Name</label>\n" +
    "																<input type=\"text\" ng-model=\"userType.name\" required>\n" +
    "														</md-input-container>\n" +
    "														<div flex>\n" +
    "																<md-autocomplete md-selected-item=\"data.selectedArea\"\n" +
    "																								 md-search-text=\"data.searchAreaText\"\n" +
    "																								 md-selected-item-change=\"selectArea(area)\"\n" +
    "																								 md-items=\"area in loadArea(data.searchAreaText)\"\n" +
    "																								 md-item-text=\"area.name\"\n" +
    "																								 required\n" +
    "																								 md-delay=\"300\"\n" +
    "																								 md-min-length=\"0\"\n" +
    "																								 md-require-match\n" +
    "																								 md-floating-label=\"Area\">\n" +
    "																		<md-item-template>\n" +
    "																				<span md-highlight-text=\"data.searchAreaText\">{{area.name}}</span>\n" +
    "																		</md-item-template>\n" +
    "																		<md-not-found>\n" +
    "																				No matching \"{{data.searchAreaText}}\" areas were found.\n" +
    "																		</md-not-found>\n" +
    "																</md-autocomplete>\n" +
    "														</div>\n" +
    "												</div>\n" +
    "												<div layout=\"row\">\n" +
    "														<md-input-container flex>\n" +
    "																<label>Description</label>\n" +
    "																<textarea rows=\"2\" type=\"text\" ng-model=\"userType.description\" required></textarea>\n" +
    "														</md-input-container>\n" +
    "												</div>\n" +
    "												<div layout=\"row\">\n" +
    "														<md-input-container flex>\n" +
    "																<label>ZIP</label>\n" +
    "																<input type=\"text\" ng-model=\"userType.zip\" ng-change=\"geoLocationByZip(userType.zip)\" ng-required=\"!userType.shopping_center_id\">\n" +
    "														</md-input-container>\n" +
    "														<md-input-container flex>\n" +
    "																<label>City Name</label>\n" +
    "																<input type=\"text\" ng-model=\"userType.city\" ng-disabled=\"loadingByZip\" ng-required=\"!userType.shopping_center_id\">\n" +
    "														</md-input-container>\n" +
    "														<md-input-container flex>\n" +
    "																<label>Address</label>\n" +
    "																<input type=\"text\" ng-model=\"userType.address\" ng-disabled=\"loadingByZip\" ng-required=\"!userType.shopping_center_id\">\n" +
    "														</md-input-container>\n" +
    "												</div>\n" +
    "												<div layout=\"row\">\n" +
    "														<md-input-container flex>\n" +
    "																<label>Website</label>\n" +
    "																<input type=\"text\" placeholder=\"http://www.example.com\" ng-model=\"userType.website\"/>\n" +
    "														</md-input-container>\n" +
    "												</div>\n" +
    "												<md-button class=\"md-raised md-primary\" ng-click=\"openTimeModal($event)\">Set Shopping Center working hours</md-button>\n" +
    "										</div>\n" +
    "										<md-button class=\"md-raised md-primary\" type=\"button\" ng-click=\"register()\" pull-right ng-disabled=\"formStepTwo.$invalid || loading || !data.selectedUserType\">\n" +
    "												<span ng-show=\"!loading\">Register</span>\n" +
    "												<span ng-show=\"loading\"><i class=\"fa fa-cog fa-spin\"></i> Please wait...</span>\n" +
    "										</md-button>\n" +
    "								</div>\n" +
    "								<div ng-form=\"formStepThree\" ng-if=\"step == 3\" layout=\"column\" class=\"text-center\">\n" +
    "										<p>Thank you!</p>\n" +
    "										<p>Your registration has been submitted and your {{data.selectedUserType.id == 1 ? 'Merchant' : 'Shopping center'}} account is waiting for activation. </p>\n" +
    "										<p>After you received activation link on e-mail you can start adding coupons.</p>\n" +
    "										<md-button class=\"md-raised md-primary\" type=\"button\" ui-sref=\"login\" class=\"pull-right\">OK</md-button>\n" +
    "								</div>\n" +
    "						</md-content>\n" +
    "				</md-whiteframe>\n" +
    "		</div>\n" +
    "</md-content>\n" +
    "");
  $templateCache.put("/app/sections/settings/settings.html",
    "<!-- <md-dialog aria-label=\"Modal\" flex> -->\n" +
    "<div flex layout=\"column\">\n" +
    "    <span class=\"padding-bottom table-title\">\n" +
    "        User {{user.id ? profileText : 'Add'}}\n" +
    "    </span>\n" +
    "    <form name=\"form\">\n" +
    "        <!-- <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2>User {{user.id ? 'Edit' : 'Add'}}</h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar> -->\n" +
    "        <md-content flex layout=\"column\" layout-padding>\n" +
    "            <div layout=\"column\">\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>First Name</label>\n" +
    "                        <input ng-model=\"user.first_name\" required type=\"text\">\n" +
    "                    </md-input-container>\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Last Name</label>\n" +
    "                        <input ng-model=\"user.last_name\" required type=\"text\">\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Email</label>\n" +
    "                        <input required ng-model=\"user.email\" type=\"text\" ng-pattern=\"/^[_a-z0-9]+(\\.[_a-z0-9]+)*@[a-z0-9-]+(\\.[a-z0-9-]+)*(\\.[a-z]{2,4})$/\">\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <!-- <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Password</label>\n" +
    "                        <input ng-required=\"!user.id\" ng-minlength=\"6\" ng-model=\"user.password\" type=\"password\">\n" +
    "                        <em>* minimum 6 characters long</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Password Confirmation</label>\n" +
    "                        <input ng-required=\"!user.id\" ng-model=\"user.password_confirmation\" type=\"password\" ng-minlength=\"6\">\n" +
    "                    </md-input-container>\n" +
    "                </div> -->\n" +
    "                <div layout=\"row\" ng-if=\"user.type == 3 && user.id == session.user_id\">\n" +
    "                    <md-switch ng-model=\"user.notifications\" ng-true-value=\"1\" ng-false-value=\"0\" aria-label=\"Email notification\">\n" +
    "                        Email notification: {{ user.notifications ? 'Yes' : 'No'}}\n" +
    "                    </md-switch>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </md-content>\n" +
    "        <section layout=\"row\">\n" +
    "            <!-- <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button> -->\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading || user.password != user.password_confirmation\">\n" +
    "                <span ng-show=\"loading\">Please wait...</span>\n" +
    "                <span ng-show=\"!loading && user.id\"><span class=\"icon-lic-update btn-icon\"></span>Update</span>\n" +
    "                <span ng-show=\"!loading && !user.id\">Add</span>\n" +
    "            </md-button>\n" +
    "        </section>\n" +
    "    </form>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "<!-- </md-dialog> -->\n" +
    "");
  $templateCache.put("/app/sections/shoppingCenters/modals/merchantListModal.html",
    "<md-dialog aria-label=\"Modal\" flex>\n" +
    "    <form name=\"form\">\n" +
    "        <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2>Merchants</h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar>\n" +
    "        <md-dialog-content>\n" +
    "            <md-table-container ng-if=\"total > 0 && !loading\">\n" +
    "                <table md-table>\n" +
    "                    <thead md-head md-order=\"params.sort_by\" md-on-reorder=\"sortMerchants\">\n" +
    "                    <tr md-row>\n" +
    "                        <th md-column md-order-by=\"id\">\n" +
    "                            <span>No.</span>\n" +
    "                            <i class=\"fa fa-sort\" aria-hidden=\"true\">\n" +
    "                                <md-tooltip md-direction=\"bottom\">Sort by Id</md-tooltip>\n" +
    "                            </i>\n" +
    "                        </th>\n" +
    "                        <th md-column md-order-by=\"name\">\n" +
    "                            <span>Name</span>\n" +
    "                            <i class=\"fa fa-sort\" aria-hidden=\"true\">\n" +
    "                                <md-tooltip md-direction=\"bottom\">Sort by Name</md-tooltip>\n" +
    "                            </i>\n" +
    "                        </th>\n" +
    "                        <th md-column>\n" +
    "                            <span>Shopping Center</span>\n" +
    "                        </th>\n" +
    "                        <th></th>\n" +
    "                    </tr>\n" +
    "                    </thead>\n" +
    "                    <tbody md-body>\n" +
    "                    <tr md-row ng-repeat=\"merchant in merchants track by $index\">\n" +
    "                        <td md-cell ng-bind=\"merchant.id\"></td>\n" +
    "                        <td md-cell ng-bind=\"merchant.name\"></td>\n" +
    "                        <td md-cell ng-bind=\"merchant.shopping_center_name ? merchant.shopping_center_name : '-'\"></td>\n" +
    "                        <td md-cell text-right>\n" +
    "                            <md-button aria-label=\"Coupons\" class=\"md-raised\" ng-click=\"goToCouponsPage(merchant)\">\n" +
    "                                <i class=\"fa fa-id-card-o\" aria-hidden=\"true\"></i>\n" +
    "                                <md-tooltip md-direction=\"bottom\">Coupons</md-tooltip>\n" +
    "                            </md-button>\n" +
    "                            <md-button aria-label=\"Edit\" class=\"md-raised\"\n" +
    "                                       ng-click=\"openMerchantModal($event, merchant)\">\n" +
    "                                <i class=\"fa fa-pencil-square-o\" aria-hidden=\"true\"></i>\n" +
    "                                <md-tooltip md-direction=\"bottom\">Edit</md-tooltip>\n" +
    "                            </md-button>\n" +
    "                            <md-button aria-label=\"Remove\" class=\"md-raised md-warn\"\n" +
    "                                       ng-click=\"removeModal($event, merchant)\">\n" +
    "                                <i class=\"fa fa-trash-o\" aria-hidden=\"true\"></i>\n" +
    "                                <md-tooltip md-direction=\"bottom\">Delete</md-tooltip>\n" +
    "                            </md-button>\n" +
    "                        </td>\n" +
    "                    </tr>\n" +
    "                    </tbody>\n" +
    "                </table>\n" +
    "            </md-table-container>\n" +
    "            <h4 ng-show=\"!loading && !total\" class=\"text-center margin-top-10\">Currently there are no merchants for\n" +
    "                selected shopping centar.</h4>\n" +
    "            <h4 ng-show=\"loading\" class=\"text-center\">Please wait...</h4>\n" +
    "            <md-table-pagination ng-if=\"total > 0 && !loading\" md-options=\"[10, 20, 30]\" md-limit=\"params.limit\"\n" +
    "                                 md-page=\"params.page\"\n" +
    "                                 md-total=\"{{total}}\" md-on-paginate=\"onPaginate\" md-page-select></md-table-pagination>\n" +
    "        </md-dialog-content>\n" +
    "        <md-dialog-actions layout=\"row\">\n" +
    "            <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button>\n" +
    "        </md-dialog-actions>\n" +
    "    </form>\n" +
    "</md-dialog>");
  $templateCache.put("/app/sections/shoppingCenters/modals/shoppingCenterModal.html",
    "<md-dialog aria-label=\"Modal\" flex>\n" +
    "    <form name=\"form\">\n" +
    "        <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2>Shopping Center {{shoppingCenter.id ? 'Edit - ' + shoppingCenter.name : 'Add'}}</h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar>\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"md-dialog-content\">\n" +
    "                <md-tabs md-dynamic-height md-border-bottom md-stretch-tabs=\"always\">\n" +
    "                    <md-tab label=\"Details\">\n" +
    "                        <md-content class=\"md-padding\">\n" +
    "                            <div layout=\"row\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Name</label>\n" +
    "                                    <input name=\"name\" ng-model=\"shoppingCenter.name\" minlength=\"3\" required\n" +
    "                                           type=\"text\">\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.name.$error.required\">Please enter shopping\n" +
    "                                        center name</em>\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.name.$error.minlength\">Name must be at least\n" +
    "                                        3 characters long</em>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                            <div layout=\"row\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Description</label>\n" +
    "                                    <textarea name=\"description\" minlength=\"3\" required\n" +
    "                                              ng-model=\"shoppingCenter.description\" rows=\"5\"\n" +
    "                                              md-select-on-focus></textarea>\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.description.$error.required\">Please enter\n" +
    "                                        description</em>\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.description.$error.minlength\">Description\n" +
    "                                        must be at least 3 characters long</em>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                            <div layout=\"row\">\n" +
    "                                <div flex>\n" +
    "                                    <md-autocomplete md-input-name=\"area\" md-selected-item=\"selectedArea\"\n" +
    "                                                     md-search-text=\"searchAreaText\"\n" +
    "                                                     md-selected-item-change=\"selectArea(area)\"\n" +
    "                                                     required md-items=\"area in loadArea(searchAreaText)\"\n" +
    "                                                     md-item-text=\"area.name\" md-require-match\n" +
    "                                                     md-delay=\"300\" md-min-length=\"0\" md-floating-label=\"Area\">\n" +
    "                                        <md-item-template>\n" +
    "                                            <span md-highlight-text=\"searchAreaText\">{{area.name}}</span>\n" +
    "                                        </md-item-template>\n" +
    "                                        <md-not-found>\n" +
    "                                            No states matching \"{{searchAreaText}}\" were found.\n" +
    "                                        </md-not-found>\n" +
    "                                        <em class=\"error-message\" ng-show=\"form.area.$error.required\">Please select\n" +
    "                                            area</em>\n" +
    "                                    </md-autocomplete>\n" +
    "                                </div>\n" +
    "                            </div>\n" +
    "                            <div layout=\"row\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Zip</label>\n" +
    "                                    <input name=\"zip\"\n" +
    "                                           ng-model=\"shoppingCenter.zip\"\n" +
    "                                           ng-change=\"geoLocationByZip(shoppingCenter.zip)\"\n" +
    "                                           ng-required=\"!shoppingCenter.lat || !shoppingCenter.lon\"\n" +
    "                                           type=\"text\">\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.zip.$error.required\">Please enter ZIP\n" +
    "                                        code</em>\n" +
    "                                </md-input-container>\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Address</label>\n" +
    "                                    <input name=\"address\" ng-model=\"shoppingCenter.address\" required\n" +
    "                                           ng-disabled=\"loadingByZip\" type=\"text\">\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.address.$error.required\">Please enter\n" +
    "                                        address</em>\n" +
    "                                </md-input-container>\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>City</label>\n" +
    "                                    <input name=\"city\" ng-model=\"shoppingCenter.city\" required\n" +
    "                                           ng-disabled=\"loadingByZip\" type=\"text\">\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.city.$error.required\">Please enter city\n" +
    "                                        name</em>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                            <div layout=\"row\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Latitude</label>\n" +
    "                                    <input name=\"lat\" ng-model=\"shoppingCenter.lat\" required ng-disabled=\"loadingByZip\"\n" +
    "                                           type=\"number\" step=\"any\">\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.lat.$error.required\">Please enter\n" +
    "                                        latitude</em>\n" +
    "                                </md-input-container>\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Longitude</label>\n" +
    "                                    <input name=\"lng\" ng-model=\"shoppingCenter.lon\" required ng-disabled=\"loadingByZip\"\n" +
    "                                           type=\"number\" step=\"any\">\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.lng.$error.required\">Please enter\n" +
    "                                        Longitude</em>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                            <div layout=\"row\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Website</label>\n" +
    "                                    <input ng-model=\"shoppingCenter.website\" placeholder=\"http://www.example.com\"\n" +
    "                                           type=\"text\" name=\"website\">\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.website.$error.required\">Please enter\n" +
    "                                        website (http://www.example.com)</em>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                            <div layout=\"column\">\n" +
    "                                <h4>Shopping center logo</h4>\n" +
    "                                <div ng-if=\"imagePreparedForUpload\" file=\"imagePreparedForUpload._file\" width=\"140\" height=\"140\" ng-thumb></div>\n" +
    "                                <div class=\"merchant-logo-container\" ng-if=\"shoppingCenter.logo && !imagePreparedForUpload\">\n" +
    "                                    <a href=\"#\" ng-click=\"removeLogo()\"><i class=\"fa fa-minus-circle\" aria-hidden=\"true\"></i></a>\n" +
    "                                    <img width=\"140\" height=\"140\" ng-src=\"{{shoppingCenter.logo}}\">\n" +
    "                                </div>\n" +
    "                            </div>\n" +
    "                            <input type=\"file\" nv-file-select=\"\" uploader=\"uploader\" />\n" +
    "                        </md-content>\n" +
    "                    </md-tab>\n" +
    "                    <md-tab label=\"Working hours\">\n" +
    "                        <md-content class=\"md-padding\" ng-form=\"timeForm\">\n" +
    "                            <div layout=\"row\" class=\"working-hours-all\">\n" +
    "                                <span>Set all from</span>\n" +
    "                                <mdp-time-picker name=\"allFrom\" ng-model=\"all.from\"></mdp-time-picker>\n" +
    "                                <span>to</span>\n" +
    "                                <mdp-time-picker name=\"allTo\" ng-model=\"all.to\"></mdp-time-picker>\n" +
    "                                <md-input-container>\n" +
    "                                    <md-button class=\"md-raised working-hours-margin-fix\" ng-click=\"setTime()\">Set\n" +
    "                                    </md-button>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                            <md-table-container>\n" +
    "                                <table md-table>\n" +
    "                                    <thead md-head>\n" +
    "                                    <tr md-row>\n" +
    "                                        <th md-column>Week Day</th>\n" +
    "                                        <th md-column>From</th>\n" +
    "                                        <th md-column>To</th>\n" +
    "                                    </tr>\n" +
    "                                    </thead>\n" +
    "                                    <tbody md-body>\n" +
    "                                    <tr md-row ng-repeat=\"day in shoppingCenter.working_hours\">\n" +
    "                                        <td md-cell>\n" +
    "                                            <span>{{day.day}}</span>\n" +
    "                                        </td>\n" +
    "                                        <td md-cell>\n" +
    "                                            <mdp-time-picker name=\"dayFrom{{day.day}}\"\n" +
    "                                                             ng-class=\"{'work-day-invalid': day.to && !day.from}\"\n" +
    "                                                             ng-model=\"day.from\">\n" +
    "                                                <div ng-if=\"day.to && !day.from\" class=\"red\">This is required</div>\n" +
    "                                            </mdp-time-picker>\n" +
    "                                        </td>\n" +
    "                                        <td md-cell>\n" +
    "                                            <mdp-time-picker name=\"dayTo{{day.day}}\"\n" +
    "                                                             ng-class=\"{'work-day-invalid': day.from && !day.to }\"\n" +
    "                                                             ng-model=\"day.to\">\n" +
    "                                                <div ng-if=\"day.from && !day.to\" class=\"red\">This is required</div>\n" +
    "                                            </mdp-time-picker>\n" +
    "                                        </td>\n" +
    "                                    </tr>\n" +
    "                                    </tbody>\n" +
    "                                </table>\n" +
    "                            </md-table-container>\n" +
    "                        </md-content>\n" +
    "                    </md-tab>\n" +
    "                </md-tabs>\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "        <md-dialog-actions layout=\"row\">\n" +
    "            <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button>\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\"\n" +
    "                       ng-disabled=\"form.$invalid || loading\">\n" +
    "                <span ng-show=\"loading\">Please wait...</span>\n" +
    "                <span ng-show=\"!loading && shoppingCenter.id\">Update</span>\n" +
    "                <span ng-show=\"!loading && !shoppingCenter.id\">Add</span>\n" +
    "            </md-button>\n" +
    "        </md-dialog-actions>\n" +
    "    </form>\n" +
    "</md-dialog>");
  $templateCache.put("/app/sections/shoppingCenters/modals/shoppingCenterTimeModal.html",
    "<md-dialog aria-label=\"Modal\" flex>\n" +
    "    <form name=\"form\">\n" +
    "        <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2>Working Days</h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar>\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"md-dialog-content\">\n" +
    "                <div layout=\"row\" class=\"working-hours-all\">\n" +
    "                    <span>Set all from</span>\n" +
    "                    <mdp-time-picker name=\"allFrom\" ng-model=\"all.from\"></mdp-time-picker>\n" +
    "                    <span>to</span>\n" +
    "                    <mdp-time-picker name=\"allTo\" ng-model=\"all.to\"></mdp-time-picker>\n" +
    "                    <md-input-container>\n" +
    "                        <md-button class=\"md-raised working-hours-margin-fix\" ng-click=\"setTime()\">Set</md-button>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <md-table-container>\n" +
    "                    <table md-table>\n" +
    "                        <thead md-head>\n" +
    "                            <tr md-row>\n" +
    "                                <th md-column>Week Day</th>\n" +
    "                                <th md-column>From</th>\n" +
    "                                <th md-column>To</th>\n" +
    "                            </tr>\n" +
    "                        </thead>\n" +
    "                        <tbody md-body>\n" +
    "                            <tr md-row ng-repeat=\"day in workingDays\">\n" +
    "                                <td md-cell>\n" +
    "                                    <span>{{day.day}}</span>\n" +
    "                                </td>\n" +
    "                                <td md-cell>\n" +
    "                                    <mdp-time-picker ng-model=\"day.from\"></mdp-time-picker>\n" +
    "                                </td>\n" +
    "                                <td md-cell>\n" +
    "                                    <mdp-time-picker ng-model=\"day.to\"></mdp-time-picker>\n" +
    "                                </td>\n" +
    "                            </tr>\n" +
    "                        </tbody>\n" +
    "                    </table>\n" +
    "                </md-table-container>\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "        <md-dialog-actions layout=\"row\">\n" +
    "            <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button>\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading\">\n" +
    "                <span ng-show=\"loading\">Please wait...</span>\n" +
    "                <span ng-show=\"!loading && shoppingCenter.id\">Update</span>\n" +
    "                <span ng-show=\"!loading && !shoppingCenter.id\">Add</span>\n" +
    "            </md-button>\n" +
    "        </md-dialog-actions>\n" +
    "    </form>\n" +
    "</md-dialog>");
  $templateCache.put("/app/sections/shoppingCenters/shopping-centers.html",
    "<div>\n" +
    "    <div layout=\"column\">\n" +
    "        <span class=\"padding-bottom-0\"><i class=\"fa fa-database\" aria-hidden=\"true\"></i> Shopping Centers</span>\n" +
    "        <form novalidate flex layout=\"row\" ng-submit=\"search()\">\n" +
    "            <md-input-container flex>\n" +
    "                <label>Search</label>\n" +
    "                <input type=\"text\" autocomplete=\"off\" ng-disabled=\"!total && !params.search\" ng-model=\"params.search\"\n" +
    "                       ng-change=\"search()\">\n" +
    "            </md-input-container>\n" +
    "            <md-button class=\"md-fab md-mini\" type=\"submit\" ng-disabled=\"!total && !params.search\" aria-label=\"Search\">\n" +
    "                <i class=\"fa fa-search\"></i>\n" +
    "            </md-button>\n" +
    "            <md-input-container class=\"no\" ng-if=\"session.role =='admin'\">\n" +
    "                <md-button class=\"md-raised md-primary\" type=\"button\" ng-click=\"shoppingCenterModal($event)\"\n" +
    "                           aria-label=\"Add\">\n" +
    "                    Add\n" +
    "                </md-button>\n" +
    "            </md-input-container>\n" +
    "        </form>\n" +
    "        <h4 ng-show=\"loading\" class=\"text-center\">Please wait...</h4>\n" +
    "        <md-table-container ng-if=\"total > 0 && !loading\">\n" +
    "            <table md-table md-progress=\"promise\">\n" +
    "                <thead md-head md-order=\"params.sort_by\" md-on-reorder=\"sortShoppingCenters\">\n" +
    "                <tr md-row>\n" +
    "                    <th md-column md-order-by=\"name\">\n" +
    "                        <span>Name</span>\n" +
    "                        <i class=\"fa fa-sort\" aria-hidden=\"true\">\n" +
    "                            <md-tooltip md-direction=\"bottom\">Sort by Name</md-tooltip>\n" +
    "                        </i>\n" +
    "                    </th>\n" +
    "                    <th md-column md-order-by=\"area_name\">\n" +
    "                        <span>Area</span>\n" +
    "                        <i class=\"fa fa-sort\" aria-hidden=\"true\">\n" +
    "                            <md-tooltip md-direction=\"bottom\">Sort by Area</md-tooltip>\n" +
    "                        </i>\n" +
    "                    </th>\n" +
    "                </tr>\n" +
    "                </thead>\n" +
    "                <tbody md-body>\n" +
    "                <tr md-row ng-repeat=\"shoppingCenter in shoppingCenters track by $index\">\n" +
    "                    <td md-cell ng-bind=\"shoppingCenter.name\"></td>\n" +
    "                    <td md-cell ng-bind=\"shoppingCenter.area_name\"></td>\n" +
    "                    <td md-cell text-right>\n" +
    "                        <md-button class=\"md-raised\" ng-click=\"merchantsModal($event, shoppingCenter)\">\n" +
    "                            <i class=\"fa fa-list-alt\" aria-hidden=\"true\"></i>\n" +
    "                            <md-tooltip md-direction=\"bottom\">Merchants</md-tooltip>\n" +
    "                        </md-button>\n" +
    "                        <md-button class=\"md-raised\" ng-click=\"shoppingCenterModal($event, shoppingCenter)\">\n" +
    "                            <i class=\"fa fa-pencil-square-o\" aria-hidden=\"true\"></i>\n" +
    "                            <md-tooltip md-direction=\"bottom\">Edit</md-tooltip>\n" +
    "                        </md-button>\n" +
    "                        <md-button class=\"md-raised md-warn\" ng-if=\"session.role != 'sc-user'\" ng-disabled=\"shoppingCenter.loading\"\n" +
    "                                   ng-click=\"removeModal($event, shoppingCenter)\">\n" +
    "                            <i class=\"fa fa-trash-o\" aria-hidden=\"true\"></i>\n" +
    "                            <md-tooltip md-direction=\"bottom\">Delete</md-tooltip>\n" +
    "                        </md-button>\n" +
    "                    </td>\n" +
    "                </tr>\n" +
    "                </tbody>\n" +
    "            </table>\n" +
    "        </md-table-container>\n" +
    "        <h4 ng-show=\"!loading && !total && !params.search\" class=\"text-center\">Currently there are no shopping centers\n" +
    "            in your database.</h4>\n" +
    "        <md-table-pagination ng-if=\"total > 0 && !loading\" md-options=\"[10, 20, 30]\" md-limit=\"params.limit\"\n" +
    "                             md-page=\"params.page\"\n" +
    "                             md-total=\"{{total}}\" md-on-paginate=\"onPaginate\" md-page-select></md-table-pagination>\n" +
    "    </div>\n" +
    "</div>");
  $templateCache.put("/app/sections/shoppingSettings/shoppingSettings.html",
    "<div ng-if=\"session.role == 'sc-user'\" flex layout=\"column\">\n" +
    "     <span class=\"padding-bottom table-title\">\n" +
    "        {{shoppingCenter.id ? 'Edit - ' + shoppingCenter.name : 'Add'}}\n" +
    "    </span>\n" +
    "    <form name=\"form\">\n" +
    "        <!-- <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2>Shopping Center {{shoppingCenter.id ? 'Edit - ' + shoppingCenter.name : 'Add'}}</h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar> -->\n" +
    "        <md-content flex layout=\"column\" layout-padding>\n" +
    "            <div layout=\"column\">\n" +
    "                <md-tabs md-dynamic-height md-border-bottom md-stretch-tabs=\"always\">\n" +
    "                    <md-tab label=\"Details\">\n" +
    "                        <md-content class=\"md-padding\">\n" +
    "                            <div layout=\"column\">\n" +
    "                                <h4>Shopping center logo</h4>\n" +
    "                                <div ng-if=\"imagePreparedForUpload\" file=\"imagePreparedForUpload._file\" width=\"140\" height=\"140\" ng-thumb></div>\n" +
    "                                <div class=\"merchant-logo-container\" ng-if=\"shoppingCenter.logo && !imagePreparedForUpload\">\n" +
    "                                    <a href=\"#\" ng-click=\"removeLogo()\"><i class=\"fa fa-minus-circle\" aria-hidden=\"true\"></i></a>\n" +
    "                                    <img width=\"140\" height=\"140\" ng-src=\"{{shoppingCenter.logo}}\">\n" +
    "                                </div>\n" +
    "                            </div>\n" +
    "                            <input type=\"file\" nv-file-select=\"\" uploader=\"uploader\" />\n" +
    "                            <div layout=\"row\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Name</label>\n" +
    "                                    <input name=\"name\" ng-model=\"shoppingCenter.name\" minlength=\"3\" required\n" +
    "                                           type=\"text\">\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.name.$error.required\">Please enter shopping\n" +
    "                                        center name</em>\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.name.$error.minlength\">Name must be at least\n" +
    "                                        3 characters long</em>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                            <div layout=\"row\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Description</label>\n" +
    "                                    <textarea name=\"description\" minlength=\"3\" required\n" +
    "                                              ng-model=\"shoppingCenter.description\" rows=\"5\"\n" +
    "                                              md-select-on-focus></textarea>\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.description.$error.required\">Please enter\n" +
    "                                        description</em>\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.description.$error.minlength\">Description\n" +
    "                                        must be at least 3 characters long</em>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                            <div layout=\"row\">\n" +
    "                                <div flex>\n" +
    "                                    <md-autocomplete md-input-name=\"area\" \n" +
    "                                                     md-search-text=\"searchAreaText\"\n" +
    "                                                     md-selected-item-change=\"selectArea(area)\"\n" +
    "                                                     required md-items=\"area in loadArea(searchAreaText)\"\n" +
    "                                                     md-item-text=\"area.name\" md-require-match\n" +
    "                                                     md-delay=\"300\" md-min-length=\"0\" md-floating-label=\"Area\">\n" +
    "                                        <md-item-template>\n" +
    "                                            <span md-highlight-text=\"searchAreaText\">{{area.name}}</span>\n" +
    "                                        </md-item-template>\n" +
    "                                        <md-not-found>\n" +
    "                                            No states matching \"{{searchAreaText}}\" were found.\n" +
    "                                        </md-not-found>\n" +
    "                                        <em class=\"error-message\" ng-show=\"form.area.$error.required\">Please select\n" +
    "                                            area</em>\n" +
    "                                    </md-autocomplete>\n" +
    "                                </div>\n" +
    "                            </div>\n" +
    "                            <div layout=\"row\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Zip</label>\n" +
    "                                    <input name=\"zip\"\n" +
    "                                           ng-model=\"shoppingCenter.zip\"\n" +
    "                                           ng-change=\"geoLocationByZip(shoppingCenter.zip)\"\n" +
    "                                           ng-required=\"!shoppingCenter.lat || !shoppingCenter.lon\"\n" +
    "                                           type=\"text\">\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.zip.$error.required\">Please enter ZIP\n" +
    "                                        code</em>\n" +
    "                                </md-input-container>\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Address</label>\n" +
    "                                    <input name=\"address\" ng-model=\"shoppingCenter.address\" required\n" +
    "                                           ng-disabled=\"loadingByZip\" type=\"text\">\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.address.$error.required\">Please enter\n" +
    "                                        address</em>\n" +
    "                                </md-input-container>\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>City</label>\n" +
    "                                    <input name=\"city\" ng-model=\"shoppingCenter.city\" required\n" +
    "                                           ng-disabled=\"loadingByZip\" type=\"text\">\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.city.$error.required\">Please enter city\n" +
    "                                        name</em>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                            <div layout=\"row\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Latitude</label>\n" +
    "                                    <input name=\"lat\" ng-model=\"shoppingCenter.lat\" required ng-disabled=\"loadingByZip\"\n" +
    "                                           type=\"number\" step=\"any\">\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.lat.$error.required\">Please enter\n" +
    "                                        latitude</em>\n" +
    "                                </md-input-container>\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Longitude</label>\n" +
    "                                    <input name=\"lng\" ng-model=\"shoppingCenter.lon\" required ng-disabled=\"loadingByZip\"\n" +
    "                                           type=\"number\" step=\"any\">\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.lng.$error.required\">Please enter\n" +
    "                                        Longitude</em>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                            <div layout=\"row\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Website</label>\n" +
    "                                    <input ng-model=\"shoppingCenter.website\" placeholder=\"http://www.example.com\"\n" +
    "                                           type=\"text\" name=\"website\">\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.website.$error.required\">Please enter\n" +
    "                                        website (http://www.example.com)</em>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                        </md-content>\n" +
    "                    </md-tab>\n" +
    "                    <md-tab label=\"Working hours\">\n" +
    "                        <md-content class=\"md-padding\" ng-form=\"timeForm\">\n" +
    "                            <div layout=\"row\" class=\"working-hours-all\">\n" +
    "                                <span>Set all from</span>\n" +
    "                                <mdp-time-picker name=\"allFrom\" ng-model=\"all.from\"></mdp-time-picker>\n" +
    "                                <span>to</span>\n" +
    "                                <mdp-time-picker name=\"allTo\" ng-model=\"all.to\"></mdp-time-picker>\n" +
    "                                <md-input-container>\n" +
    "                                    <md-button class=\"md-raised working-hours-margin-fix\" ng-click=\"setTime()\">Set\n" +
    "                                    </md-button>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                            <md-table-container>\n" +
    "                                <table md-table>\n" +
    "                                    <thead md-head>\n" +
    "                                    <tr md-row>\n" +
    "                                        <th md-column>Week Day</th>\n" +
    "                                        <th md-column>From</th>\n" +
    "                                        <th md-column>To</th>\n" +
    "                                    </tr>\n" +
    "                                    </thead>\n" +
    "                                    <tbody md-body>\n" +
    "                                    <tr md-row ng-repeat=\"day in shoppingCenter.working_hours\">\n" +
    "                                        <td md-cell>\n" +
    "                                            <span>{{day.day}}</span>\n" +
    "                                        </td>\n" +
    "                                        <td md-cell>\n" +
    "                                            <mdp-time-picker name=\"dayFrom{{day.day}}\"\n" +
    "                                                             ng-class=\"{'work-day-invalid': day.to && !day.from}\"\n" +
    "                                                             ng-model=\"day.from\">\n" +
    "                                                <div ng-if=\"day.to && !day.from\" class=\"red\">This is required</div>\n" +
    "                                            </mdp-time-picker>\n" +
    "                                        </td>\n" +
    "                                        <td md-cell>\n" +
    "                                            <mdp-time-picker name=\"dayTo{{day.day}}\"\n" +
    "                                                             ng-class=\"{'work-day-invalid': day.from && !day.to }\"\n" +
    "                                                             ng-model=\"day.to\">\n" +
    "                                                <div ng-if=\"day.from && !day.to\" class=\"red\">This is required</div>\n" +
    "                                            </mdp-time-picker>\n" +
    "                                        </td>\n" +
    "                                    </tr>\n" +
    "                                    </tbody>\n" +
    "                                </table>\n" +
    "                            </md-table-container>\n" +
    "                        </md-content>\n" +
    "                    </md-tab>\n" +
    "                </md-tabs>\n" +
    "            </div>\n" +
    "        </md-content>\n" +
    "        <section layout=\"row\">\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\"\n" +
    "                       ng-disabled=\"form.$invalid || loading\">\n" +
    "                <span ng-show=\"loading\">Please wait...</span>\n" +
    "                <span ng-show=\"!loading && shoppingCenter.id\">Update</span>\n" +
    "                <!-- <span ng-show=\"!loading && !shoppingCenter.id\">Add</span> -->\n" +
    "            </md-button>\n" +
    "        </section>\n" +
    "    </form>\n" +
    "</div>");
  $templateCache.put("/app/sections/users/modals/passwordModal.html",
    "<md-dialog aria-label=\"Modal\" flex>\n" +
    "    <form name=\"form\">\n" +
    "        <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2>Change password for {{user.first_name}} {{user.last_name}}</h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar>\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"md-dialog-content\" layout=\"column\">\n" +
    "                <div layout=\"row\" ng-if=\"session.role != 'admin'\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Old password</label>\n" +
    "                        <input required ng-model=\"model.old_password\" type=\"password\">\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>New Password</label>\n" +
    "                        <input ng-minlength=\"6\" ng-model=\"model.password\" required type=\"password\">\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <em>* minimum 6 characters long</em>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Confirm Password</label>\n" +
    "                        <input ng-minlength=\"6\" ng-model=\"model.password_confirmation\" required type=\"password\">\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "        <md-dialog-actions layout=\"row\">\n" +
    "            <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button>\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading || model.password != model.password_confirmation\">\n" +
    "                <span ng-show=\"loading\">Please wait...</span>\n" +
    "                <span ng-show=\"!loading\">Update</span>\n" +
    "            </md-button>\n" +
    "        </md-dialog-actions>\n" +
    "    </form>\n" +
    "</md-dialog>\n" +
    "");
  $templateCache.put("/app/sections/users/modals/userModal.html",
    "<md-dialog aria-label=\"Modal\" flex>\n" +
    "    <form name=\"form\">\n" +
    "        <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2>User {{user.id ? 'Edit' : 'Add'}}</h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar>\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"md-dialog-content\">\n" +
    "                <div layout=\"row\" ng-if=\"!profileEdit\">\n" +
    "                    <md-input-container>\n" +
    "                        <label>User type</label>\n" +
    "                        <md-select ng-model=\"user.type\" ng-change=\"roleChanged()\">\n" +
    "                            <md-option ng-if=\"userRole.id\" ng-repeat=\"userRole in userRoles\" ng-value=\"userRole.id\">\n" +
    "                                {{userRole.name}}\n" +
    "                            </md-option>\n" +
    "                        </md-select>\n" +
    "                    </md-input-container>\n" +
    "                    <div flex ng-if=\"user.type == 1 && !user.id\">\n" +
    "                        <md-autocomplete md-input-name=\"merchant\" md-selected-item=\"selectedMerchant\" md-search-text=\"data.searchMerchantText\" md-selected-item-change=\"selectMerchant(merchant)\"\n" +
    "                                         md-items=\"merchant in loadMerchants(data.searchMerchantText)\" md-item-text=\"merchant.name\" md-require-match md-delay=\"300\"\n" +
    "                                         md-min-length=\"0\" md-floating-label=\"Merchant\">\n" +
    "                            <md-item-template>\n" +
    "                                <span md-highlight-text=\"data.searchMerchantText\">{{merchant.name}}</span>\n" +
    "                            </md-item-template>\n" +
    "                            <md-not-found>\n" +
    "                                No matching \"{{data.searchMerchantText}}\" merchants were found.\n" +
    "                            </md-not-found>\n" +
    "                        </md-autocomplete>\n" +
    "                    </div>\n" +
    "                    <div flex ng-if=\"user.type == 2 && !user.id\">\n" +
    "                        <md-autocomplete md-input-name=\"shippingCenter\" md-selected-item=\"selectedShoppingCenter\" md-search-text=\"data.searchShoppingCenterText\" md-selected-item-change=\"selectShoppingCenter(shoppingCenter)\"\n" +
    "                                         md-items=\"shoppingCenter in loadShoppingCenters(data.searchShoppingCenterText)\" md-item-text=\"shoppingCenter.name\" md-require-match md-delay=\"300\"\n" +
    "                                         md-min-length=\"0\" md-floating-label=\"Shopping Center\">\n" +
    "                            <md-item-template>\n" +
    "                                <span md-highlight-text=\"data.searchShoppingCenterText\">{{shoppingCenter.name}}</span>\n" +
    "                            </md-item-template>\n" +
    "                            <md-not-found>\n" +
    "                                No matching \"{{data.searchShoppingCenterText}}\" shopping centers were found.\n" +
    "                            </md-not-found>\n" +
    "                        </md-autocomplete>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>First Name</label>\n" +
    "                        <input ng-model=\"user.first_name\" required type=\"text\">\n" +
    "                    </md-input-container>\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Last Name</label>\n" +
    "                        <input ng-model=\"user.last_name\" required type=\"text\">\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Email</label>\n" +
    "                        <input required ng-model=\"user.email\" type=\"text\" ng-pattern=\"/^[_a-z0-9]+(\\.[_a-z0-9]+)*@[a-z0-9-]+(\\.[a-z0-9-]+)*(\\.[a-z]{2,4})$/\">\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Password</label>\n" +
    "                        <input ng-required=\"!user.id\" ng-minlength=\"6\" ng-model=\"user.password\" type=\"password\">\n" +
    "                        <em>* minimum 6 characters long</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Password Confirmation</label>\n" +
    "                        <input ng-required=\"!user.id\" ng-model=\"user.password_confirmation\" type=\"password\" ng-minlength=\"6\">\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\" ng-if=\"user.type == 3 && user.id == session.user_id\">\n" +
    "                    <md-switch ng-model=\"user.notifications\" ng-true-value=\"1\" ng-false-value=\"0\" aria-label=\"Email notification\">\n" +
    "                        Email notification: {{ user.notifications ? 'Yes' : 'No'}}\n" +
    "                    </md-switch>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "        <md-dialog-actions layout=\"row\">\n" +
    "            <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button>\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading || user.password != user.password_confirmation\">\n" +
    "                <span ng-show=\"loading\">Please wait...</span>\n" +
    "                <span ng-show=\"!loading && user.id\">Update</span>\n" +
    "                <span ng-show=\"!loading && !user.id\">Add</span>\n" +
    "            </md-button>\n" +
    "        </md-dialog-actions>\n" +
    "    </form>\n" +
    "</md-dialog>");
  $templateCache.put("/app/sections/users/passwordChange/passwordModal.html",
    "<!-- <md-dialog aria-label=\"Modal\" flex> -->\n" +
    "<div flex layout=\"column\">\n" +
    "    <span class=\"padding-bottom table-title\">\n" +
    "        Change password for {{user.first_name}} {{user.last_name}}\n" +
    "    </span>\n" +
    "    <form name=\"form\">\n" +
    "        <!-- <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2>Change password for {{user.first_name}} {{user.last_name}}</h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar> -->\n" +
    "        <md-content flex layout=\"column\" layout-padding>\n" +
    "            <div layout=\"column\">\n" +
    "                <div layout=\"row\" ng-if=\"session.role != 'admin'\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Old password</label>\n" +
    "                        <input ng-model=\"model.old_password\" required type=\"password\">\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>New Password</label>\n" +
    "                        <input ng-minlength=\"6\" ng-model=\"model.password\" required type=\"password\">\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <em>* minimum 6 characters long</em>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Confirm Password</label>\n" +
    "                        <input ng-minlength=\"6\" ng-model=\"model.password_confirmation\" required type=\"password\">\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </md-content>\n" +
    "        <section layout=\"row\">\n" +
    "            <!-- <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button> -->\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading || model.password != model.password_confirmation\">\n" +
    "                <span ng-show=\"loading\">Please wait...</span>\n" +
    "                <span ng-show=\"!loading\"><span class=\"icon-lic-update btn-icon\"></span>Update</span>\n" +
    "            </md-button>\n" +
    "        </section>\n" +
    "    </form>\n" +
    "</div>\n" +
    "<!-- </md-dialog> -->\n" +
    "");
  $templateCache.put("/app/sections/users/userEdit/userModal.html",
    "<!-- <md-dialog aria-label=\"Modal\" flex> -->\n" +
    "<div flex layout=\"column\">\n" +
    "    <span class=\"padding-bottom table-title\">\n" +
    "        User {{user.id ? 'Edit' : 'Add'}}\n" +
    "    </span>\n" +
    "    <form name=\"form\">\n" +
    "        <!-- <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2>User {{user.id ? 'Edit' : 'Add'}}</h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar> -->\n" +
    "        <md-content flex layout=\"column\" layout-padding>\n" +
    "            <div layout=\"column\">\n" +
    "                <div layout=\"row\" ng-if=\"!profileEdit\">\n" +
    "                    <md-input-container>\n" +
    "                        <label>User type</label>\n" +
    "                        <md-select ng-model=\"user.type\" ng-change=\"roleChanged()\">\n" +
    "                            <md-option ng-if=\"userRole.id\" ng-repeat=\"userRole in userRoles\" ng-value=\"userRole.id\">\n" +
    "                                {{userRole.name}}\n" +
    "                            </md-option>\n" +
    "                        </md-select>\n" +
    "                    </md-input-container>\n" +
    "                    <div flex ng-if=\"user.type == 1\">\n" +
    "                        <md-autocomplete md-input-name=\"merchant\" ng-disabled=\"editType\" md-selected-item=\"selectedMerchant\" required md-search-text=\"data.searchMerchantText\" md-selected-item-change=\"selectMerchant(merchant)\"\n" +
    "                                         md-items=\"merchant in loadMerchants(data.searchMerchantText)\" md-item-text=\"merchant.name\" md-delay=\"300\"\n" +
    "                                         md-min-length=\"0\" md-floating-label=\"Merchant\">\n" +
    "                            <md-item-template>\n" +
    "                                <span md-highlight-text=\"data.searchMerchantText\">{{merchant.name}}</span>\n" +
    "                            </md-item-template>\n" +
    "                            <md-not-found>\n" +
    "                                No matching \"{{data.searchMerchantText}}\" merchants were found.\n" +
    "                            </md-not-found>\n" +
    "                        </md-autocomplete>\n" +
    "                    </div>\n" +
    "                    <div class=\"edit_merchant_icon\" flex ng-if=\"editType\">\n" +
    "                        <i ng-click=\"enableEdit()\" class=\"fa fa-edit\" aria-hidden=\"true\" title=\"Edit merchant\"></i>\n" +
    "                    </div> \n" +
    "\n" +
    "                    <div flex ng-if=\"user.type == 2 && !user.id\">\n" +
    "                        <md-autocomplete md-input-name=\"shippingCenter\" md-selected-item=\"selectedShoppingCenter\" md-search-text=\"data.searchShoppingCenterText\" md-selected-item-change=\"selectShoppingCenter(shoppingCenter)\"\n" +
    "                                         md-items=\"shoppingCenter in loadShoppingCenters(data.searchShoppingCenterText)\" md-item-text=\"shoppingCenter.name\" md-require-match md-delay=\"300\"\n" +
    "                                         md-min-length=\"0\" md-floating-label=\"Shopping Center\">\n" +
    "                            <md-item-template>\n" +
    "                                <span md-highlight-text=\"data.searchShoppingCenterText\">{{shoppingCenter.name}}</span>\n" +
    "                            </md-item-template>\n" +
    "                            <md-not-found>\n" +
    "                                No matching \"{{data.searchShoppingCenterText}}\" shopping centers were found.\n" +
    "                            </md-not-found>\n" +
    "                        </md-autocomplete>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>First Name</label>\n" +
    "                        <input ng-model=\"user.first_name\" required type=\"text\">\n" +
    "                    </md-input-container>\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Last Name</label>\n" +
    "                        <input ng-model=\"user.last_name\" required type=\"text\">\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Email</label>\n" +
    "                        <input required ng-model=\"user.email\" type=\"text\" ng-pattern=\"/^[_a-z0-9]+(\\.[_a-z0-9]+)*@[a-z0-9-]+(\\.[a-z0-9-]+)*(\\.[a-z]{2,4})$/\">\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\" ng-if=\"!user.id\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Password</label>\n" +
    "                        <input ng-required=\"!user.id\" ng-minlength=\"6\" ng-model=\"user.password\" type=\"password\">\n" +
    "                        <em>* minimum 6 characters long</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\" ng-if=\"!user.id\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Password Confirmation</label>\n" +
    "                        <input ng-required=\"!user.id\" ng-model=\"user.password_confirmation\" type=\"password\" ng-minlength=\"6\">\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\" ng-if=\"user.type == 3 && user.id == session.user_id\">\n" +
    "                    <md-switch ng-model=\"user.notifications\" ng-true-value=\"1\" ng-false-value=\"0\" aria-label=\"Email notification\">\n" +
    "                        Email notification: {{ user.notifications ? 'Yes' : 'No'}}\n" +
    "                    </md-switch>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </md-content>\n" +
    "        <section layout=\"row\">\n" +
    "            <!-- <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button> -->\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading || user.password != user.password_confirmation\">\n" +
    "                <span ng-show=\"loading\">Please wait...</span>\n" +
    "                <span ng-show=\"!loading && user.id\"><span class=\"icon-lic-update btn-icon\"></span>Update</span>\n" +
    "                <span ng-show=\"!loading && !user.id\"><span class=\"icon-lic-save btn-icon\"></span> Add</span>\n" +
    "            </md-button>\n" +
    "        </section>\n" +
    "    </form>\n" +
    "</div>\n" +
    "<!-- </md-dialog> -->");
  $templateCache.put("/app/sections/users/users.html",
    "<div>\n" +
    "    <div layout=\"column\">\n" +
    "        <span class=\"table-title padding-bottom\">\n" +
    "            <!-- <i class=\"fa fa-database\" aria-hidden=\"true\"></i> -->\n" +
    "             Users</span>\n" +
    "        <form novalidate flex layout=\"row\" ng-submit=\"search()\">\n" +
    "            <md-input-container>\n" +
    "                <label>User type</label>\n" +
    "                <md-select ng-model=\"params.type\" ng-change=\"filterRoleChanges()\">\n" +
    "                    <md-option ng-repeat=\"userRole in userRoles\" ng-value=\"userRole.id\">\n" +
    "                        {{userRole.name}}\n" +
    "                    </md-option>\n" +
    "                </md-select>\n" +
    "            </md-input-container>\n" +
    "            <md-input-container flex>\n" +
    "                <label>Search</label>\n" +
    "                <input type=\"text\" autocomplete=\"off\" ng-disabled=\"!total && !params.search\" ng-model=\"params.search\" ng-change=\"search()\">\n" +
    "            </md-input-container>\n" +
    "            <!-- <md-button class=\"md-fab md-mini\" type=\"submit\" ng-disabled=\"!total && !params.search\" aria-label=\"Search\">\n" +
    "                <i class=\"fa fa-search\"></i>\n" +
    "            </md-button> -->\n" +
    "            <md-input-container class=\"no\">\n" +
    "                <md-button class=\"md-raised md-primary\" type=\"button\" ng-click=\"openUserAdd()\" aria-label=\"Add\">\n" +
    "                    <span class=\"icon-lic-add btn-icon\"></span>Add New User\n" +
    "                </md-button>\n" +
    "            </md-input-container>\n" +
    "        </form>\n" +
    "        <h4 ng-show=\"loading\" class=\"text-center\">Please wait...</h4>\n" +
    "        <md-table-container ng-if=\"total > 0 && !loading\" class=\"user-table\">\n" +
    "            <table md-table md-progress=\"promise\">\n" +
    "                <thead md-head md-order=\"params.sort_by\" md-on-reorder=\"sortUsers\">\n" +
    "                    <tr md-row>\n" +
    "                        <th md-column md-order-by=\"id\">\n" +
    "                            <span>No.</span>\n" +
    "                            <i class=\"fa fa-sort\" aria-hidden=\"true\">\n" +
    "                                <md-tooltip md-direction=\"bottom\">Sort by No.</md-tooltip>\n" +
    "                            </i>\n" +
    "                        </th>\n" +
    "                        <th md-column md-order-by=\"first_name\">\n" +
    "                            <span>First name</span>\n" +
    "                            <i class=\"fa fa-sort\" aria-hidden=\"true\">\n" +
    "                                <md-tooltip md-direction=\"bottom\">Sort by First name</md-tooltip>\n" +
    "                            </i>\n" +
    "                        </th>\n" +
    "                        <th md-column md-order-by=\"last_name\">\n" +
    "                            <span>Last name</span>\n" +
    "                            <i class=\"fa fa-sort\" aria-hidden=\"true\">\n" +
    "                                <md-tooltip md-direction=\"bottom\">Sort by Last name</md-tooltip>\n" +
    "                            </i>\n" +
    "                        </th>\n" +
    "												<th md-column md-order-by=\"email\">\n" +
    "														<span>Email</span>\n" +
    "														<i class=\"fa fa-sort\" aria-hidden=\"true\">\n" +
    "																<md-tooltip md-direction=\"bottom\">Sort by Email</md-tooltip>\n" +
    "														</i>\n" +
    "												</th>\n" +
    "                        <th md-column md-order-by=\"type\">\n" +
    "                            <span>User type</span>\n" +
    "                            <i class=\"fa fa-sort\" aria-hidden=\"true\">\n" +
    "                                <md-tooltip md-direction=\"bottom\">Sort by User type</md-tooltip>\n" +
    "                            </i>\n" +
    "                        </th>\n" +
    "                        <th md-column>Active</th>\n" +
    "                    </tr>\n" +
    "                </thead>\n" +
    "                <tbody md-body>\n" +
    "                    <tr md-row ng-repeat=\"user in users track by $index\">\n" +
    "                        <td md-cell ng-bind=\"user.id\"></td>\n" +
    "                        <td md-cell ng-bind=\"user.first_name ? user.first_name : '-'\"></td>\n" +
    "                        <td md-cell ng-bind=\"user.last_name ? user.last_name : '-'\"></td>\n" +
    "                        <td md-cell ng-bind=\"user.email\"></td>\n" +
    "                        <td md-cell ng-bind=\"userRolesObject[user.type]\"></td>\n" +
    "                        <td md-cell width=\"10%\">\n" +
    "                            <md-switch nomrg nopadd ng-change=\"toggleActive(user)\" ng-model=\"user.active\" ng-true-value=\"1\" ng-false-value=\"0\" aria-label=\"Active\"></md-switch>\n" +
    "                        </td>\n" +
    "                        <td md-cell text-right>\n" +
    "                            <md-menu md-position-mode=\"target-right target\">\n" +
    "                                <md-button aria-label=\"Open demo menu\" ng-click=\"$mdOpenMenu($event)\">\n" +
    "                                    Options <i class=\"fa fa-caret-down\" aria-hidden=\"true\"></i>\n" +
    "                                </md-button>\n" +
    "                                <md-menu-content width=\"4\">\n" +
    "                                    <md-menu-item>\n" +
    "                                        <md-button ng-click=\"openUserEdit(user)\">\n" +
    "                                            <div layout=\"row\" flex>\n" +
    "                                                <span>Edit</span>\n" +
    "                                            </div>\n" +
    "                                        </md-button>\n" +
    "                                    </md-menu-item>\n" +
    "                                    <md-menu-item>\n" +
    "                                        <md-button ng-click=\"openPasswordChange(user)\">\n" +
    "                                            <div layout=\"row\" flex>\n" +
    "                                                <span>Change password</span>\n" +
    "                                            </div>\n" +
    "                                        </md-button>\n" +
    "                                    </md-menu-item>\n" +
    "                                    <md-menu-item>\n" +
    "                                        <md-button ng-click=\"deleteUser($event, user)\">\n" +
    "                                            <div layout=\"row\" flex>\n" +
    "                                                <span flex>Delete</span>\n" +
    "                                            </div>\n" +
    "                                        </md-button>\n" +
    "                                    </md-menu-item>\n" +
    "                                </md-menu-content>\n" +
    "                            </md-menu>\n" +
    "                        </td>\n" +
    "                    </tr>\n" +
    "                </tbody>\n" +
    "            </table>\n" +
    "        </md-table-container>\n" +
    "        <h4 ng-show=\"!loading && !total && !params.search\" class=\"text-center\">Currently there are no users in your database.</h4>\n" +
    "        <md-table-pagination ng-if=\"total > 0 && !loading\" md-options=\"[10, 20, 30]\" md-limit=\"params.limit\" md-page=\"params.page\"\n" +
    "            md-total=\"{{total}}\" md-on-paginate=\"onPaginate\" md-page-select></md-table-pagination>\n" +
    "    </div>\n" +
    "</div>");
}]);
