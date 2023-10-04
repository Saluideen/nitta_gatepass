from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in nitta_gatepass/__init__.py
from nitta_gatepass import __version__ as version

setup(
	name="nitta_gatepass",
	version=version,
	description="Nitta Gatepass",
	author="Ideenkreise",
	author_email="nitta@gmail.com",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
