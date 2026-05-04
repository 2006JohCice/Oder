/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps, jsx-a11y/anchor-is-valid, jsx-a11y/anchor-has-content, no-multi-str */

function LoadingCart() {
    const a = Array.from({ length:5});

    return (
        <>
        {a.map((_,idx)=>(
            <tr >
                <td>

                    <p aria-hidden="true">
                        <span class="placeholder col-6"></span>
                    </p>

                </td>

                <td>

                    <p aria-hidden="true">
                        <span class="placeholder col-6"></span>
                    </p>

                </td>
                <td>

                    <p aria-hidden="true">
                        <span class="placeholder col-6"></span>
                    </p>

                </td>
                <td>

                    <p aria-hidden="true">
                        <span class="placeholder col-6"></span>
                    </p>


                </td>
                <td>


                    <p aria-hidden="true">
                        <span class="placeholder col-6"></span>
                    </p>

                </td>

                <td>
                    <p aria-hidden="true">
                        <span class="placeholder col-6"></span>
                    </p>
                </td>
                <td>

                    <p aria-hidden="true">
                        <span class="placeholder col-6"></span>
                    </p>

                </td>
                <td>
                    <p aria-hidden="true">
                        <span class="placeholder col-6"></span>
                    </p>
                </td>
                <td style={{ display: "flex", gap: "5px" }}>

                    <a href="#" tabindex="-1" class="btn btn-primary disabled placeholder col-4" aria-hidden="true"></a>

                </td>
            </tr>
        ))}

        </>
    )
}

export default LoadingCart;