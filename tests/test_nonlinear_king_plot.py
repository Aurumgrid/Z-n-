import numpy as np
from src.nonlinear_king_plot import nonlinear_king_plot, run_demonstration
from scipy.optimize import curve_fit
import os

def test_nonlinear_king_plot_fitting_noise_free():
    """
    Tests the non-linear King plot fitting function with a noise-free dataset.
    This test follows the recommended practice of using a linear fit to find
    a good initial guess for the non-linear fit.
    """
    # Define true parameters for a synthetic dataset
    true_alpha = 1.2
    true_beta = 75.0
    true_gamma = -0.002
    # Use a smaller eta to avoid the pole in the test data range
    true_eta = 0.0003
    true_params = [true_alpha, true_beta, true_gamma, true_eta]

    # Generate a noise-free dataset
    delta_nu_b_data = np.linspace(-500, 500, 50)
    delta_nu_a_data = nonlinear_king_plot(delta_nu_b_data, *true_params)

    # Step 1: Perform a linear fit to get a good initial guess for alpha and beta
    def linear_king_plot(x, alpha, beta):
        return alpha * x + beta

    popt_linear, _ = curve_fit(linear_king_plot, delta_nu_b_data, delta_nu_a_data)

    # Step 2: Use the result of the linear fit as the initial guess for the non-linear fit
    initial_guess = [popt_linear[0], popt_linear[1], 0, 0]

    # Perform the non-linear fit
    popt, _ = curve_fit(nonlinear_king_plot, delta_nu_b_data, delta_nu_a_data, p0=initial_guess)

    # Check if the fitted parameters are very close to the true parameters
    # actual=popt, desired=true_params
    np.testing.assert_allclose(popt, true_params, rtol=1e-5, atol=1e-5)

def test_run_demonstration_no_error():
    """
    Tests that the demonstration function runs without raising an exception.
    """
    try:
        run_demonstration(save_plot=False)
    except Exception as e:
        assert False, f"run_demonstration(save_plot=False) raised an exception: {e}"

def test_plot_file_creation_and_cleanup():
    """
    Tests that the demonstration function creates a plot file and that it can be cleaned up.
    """
    plot_path = 'results/nonlinear_king_plot_fit.png'

    # Ensure the file doesn't exist before running
    if os.path.exists(plot_path):
        os.remove(plot_path)

    # Run the demonstration with plotting enabled
    run_demonstration(save_plot=True)

    # Check that the plot file was created
    assert os.path.exists(plot_path), f"Plot file was not created at {plot_path}"

    # Clean up the created plot file
    os.remove(plot_path)
    assert not os.path.exists(plot_path), f"Plot file was not cleaned up from {plot_path}"